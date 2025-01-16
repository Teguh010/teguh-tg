// pages/api/scheduler/report/trip_stop.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { objectTripStopServer } from "@/models/server/object";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format as dateFormat, subDays } from "date-fns";
import nodemailer from 'nodemailer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, schedule_date, format = 'pdf', email } = req.body;

    if (!token || !schedule_date) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const params = {
      object_id: 16,
      time_from: dateFormat(subDays(new Date(schedule_date), 1), "yyyy-MM-dd 00:00:00"),
      time_to: dateFormat(new Date(schedule_date), "yyyy-MM-dd 23:59:59"),
      trips_stops: 1
    };

    const reportData = await objectTripStopServer(token, params);
    
    if (!reportData.data) {
      return res.status(200).json({ 
        message: 'No data found for the specified parameters',
        parameters: params,
        response: reportData
      });
    }

    // Generate PDF if format is pdf
    if (format === 'pdf') {
      const doc = new jsPDF({ 
        putOnlyUsedFonts: true,
        orientation: 'landscape'
      });

      let head: any[] = [];
      let data: any[] = [];

      // Prepare table headers
      const tableColumns = [
        'Time From',
        'Time To',
        'Duration',
        'Distance (km)',
        'Address From',
        'Address To',
        'Fuel Used (L)',
        'Avg Speed (km/h)'
      ];
      head.push(tableColumns);

      // Prepare table data
      data = reportData.data.map(item => [
        item.time_from,
        item.time_to,
        item.duration,
        item.distance,
        item.address,
        item.next_address?.includes("<br />") 
          ? item.next_address.split("<br />").join("\n")
          : item.next_address,
        item.fuel_used,
        item.avg_speed
      ]);

      // Add title and metadata
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Trip Stop Report', 235, 15);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const date = new Date();
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      doc.text(`Date: ${formattedDate}`, 255, 20);
      let yTotals = 20;

      // Add totals section
      if (reportData.totals) {
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(10, 22, 285, 22);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Totals', 10, 30);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        let count = 0;

        // Format labels untuk totals yang lebih baik
        const formatLabel = (key: string) => {
          return key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        };

        // Format value berdasarkan tipe data
        const formatValue = (key: string, value: any) => {
          // Format waktu: hapus .000000
          if (key.includes('time')) {
            return value ? value.split('.')[0] : '00:00:00';
          }
          // Format angka: 2 desimal
          if (typeof value === 'number' || !isNaN(parseFloat(value))) {
            return Number(value).toFixed(2);
          }
          // Format teks biasa
          return value;
        };

        Object.entries(reportData.totals).forEach(([key, value]) => {
          if (value) {
            const row = Math.floor(count / 3);
            let xRow: number;
            if (count % 3 === 0) {
              xRow = 35;
            } else if (count % 3 === 1) {
              xRow = 125;
            } else {
              xRow = 215;
            }
            const yRow = (row * 5) + 30;
            yTotals = yRow;

            const formattedLabel = formatLabel(key);
            const formattedValue = formatValue(key, value);

            doc.setFont('helvetica', 'bold');
            doc.text(`${formattedLabel}: `, xRow, yRow);  // Tambah spasi setelah ":"
            doc.setFont('helvetica', 'normal');
            doc.text(formattedValue, xRow + 55, yRow);
            count++;
          }
        });

        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(10, yTotals + 5, 285, yTotals + 5);
      }

      // Add table
      autoTable(doc, {
        startY: yTotals + 10,
        head: head,
        body: data,
        bodyStyles: { fontStyle: 'bold' }
      });

      // Send PDF
      const pdfBuffer = doc.output('arraybuffer');

      // Jika ada email, kirim PDF via email
      if (email) {
        // Konfigurasi transporter
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: true, // true untuk port 465
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        // Kirim email dengan PDF attachment
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: email,
          subject: `Trip Stop Report - ${schedule_date}`,
          text: `Please find attached the Trip Stop Report for ${schedule_date}`,
          attachments: [
            {
              filename: `trip_stop_report_${schedule_date}.pdf`,
              content: Buffer.from(pdfBuffer),
              contentType: 'application/pdf',
            },
          ],
        });

        // Return success response
        return res.status(200).json({ 
          message: 'Report generated and sent to email successfully',
          email: email
        });
      }

      // Jika tidak ada email, return PDF seperti biasa
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=trip_stop_report_${schedule_date}.pdf`);
      res.send(Buffer.from(pdfBuffer));
    } else {
      // Send JSON if format is not pdf
      res.status(200).json({ 
        message: 'Report data fetched successfully',
        data: reportData
      });
    }

  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ 
      error: 'Failed to generate or send report',
      details: error.message,
      stack: error.stack
    });
  }
}