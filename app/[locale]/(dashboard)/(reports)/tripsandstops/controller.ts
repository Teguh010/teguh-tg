
"use client";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/context/UserContext";
import { objectList, objectTripStop } from "@/models/object";
import { translateObjects, cleanObjectsColumns, fetchAddresses, firstUpperLetter, parseTimeString, convertUnitDistance, convertUnitVolume, reorderObject } from "@/lib/utils";
import { useTranslation } from 'react-i18next';
import { format } from "date-fns";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TripOnly } from "./types";
import toast from "react-hot-toast";

export const controller = () => {
    const { t } = useTranslation();
    const UserContext = useUser();
    const { user, settings } = UserContext.models;
    const { getUserRef } = UserContext.operations;
    const [dataObjectTripStop, setDataObjectTripStop] = useState([]);
    const [dataObjectTripStopTotals, setDataObjectTripStopTotals] = useState({});
    const [dataObjectList, setDataObjectList] = useState(null);
    const [vehicle, setVehicle] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [dataObjectTripStopClean, setDataObjectTripStopClean] = useState(null);
    const [isGenerate, setGenerate] = useState(null);
    const [isRefresh, setRefresh] = useState(true);
    const [isLoading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState([]);
    const [minMoving, setMinMoving] = useState(null);
    const [minStationary, setMinStationary] = useState(null);
    const [tripMode, setTripMode] = useState(null);
    const [unitDistance, setUnitDistance] = useState(settings.find(setting => setting.title === "unit_distance")?.value);
    const [unitVolume, setUnitVolume] = useState(settings.find(setting => setting.title === "unit_volume")?.value);
    const [dateFormat, setDateFormat] = useState(settings.find(setting => setting.title === "date_format")?.value);
    const [timeFormat, setTimeFormat] = useState(settings.find(setting => setting.title === "time_format")?.value);
    const defaultReportType = t('trip_only');
    const [reportType, setReportType] = useState(defaultReportType);
    const [reportTypeList,] = useState([
        { title: t('trip_only') },
        { title: t('stop_only') },
        { title: t('trip_and_stop') },
    ]);
    const [searchList,] = useState([
        /* { title: "state" }, */
    ]);
    const [ignorePreList,] = useState([
        { title: t("lat_from") },
        { title: t("lon_from") },
        { title: t("lat_to") },
        { title: t("lon_to") },
        { title: t("lat") },
        { title: t("lon") },
        { title: t("next_lat") },
        { title: t("next_lon") },
        { title: t("avg_speed") },
        { title: t("address_from") },
        { title: t("address_to") },
        { title: t("fuel_used") },
        { title: t("fuel_km") },
        { title: t(`route`) },
    ]);
    const ignoreList = useMemo(() => {
        const baseList = [...ignorePreList];
        if (reportType === t('trip_only')) {
            baseList.push({ title: t("address") });
            baseList.push({ title: t("next_address") });
        }
        else if (reportType === t('stop_only')) {
            baseList.push({ title: t("from") });
            baseList.push({ title: t("to") });
            baseList.push({ title: t("next_address") });
            baseList.push({ title: t("distance_(km)") });
            baseList.push({ title: t("distance_(mi)") });
            baseList.push({ title: t("distance_(swedish_mi)") });
            baseList.push({ title: t("fuel_used_(l)") });
            baseList.push({ title: t("fuel_used_(gal)") });
        }
        else if (reportType === t('trip_and_stop')) {
            baseList.push({ title: t("address") });
            baseList.push({ title: t("next_address") });
        }
        return baseList;
    }, [ignorePreList, isGenerate]);
    const [styleColumnList,] = useState([
        /* {
            title: t('state'),
            value: (val: any = undefined) => val && "sticky left-0 bg-white z-10"
        }, */
    ]);
    const [groupList,] = useState([
        {
            title: t('state'),
            values: [
                {
                    value: t('stationary'),
                    label: firstUpperLetter(t('stationary')),
                },
                {
                    value: t('moving'),
                    label: firstUpperLetter(t('moving')),
                },
                {
                    value: t('stationary_with_ignition'),
                    label: firstUpperLetter(t('stationary_with_ignition')),
                },
            ]
        },
    ]);
    const [orderListData,] = useState([
        { title: "state" },
        { title: "from" },
        { title: "to" },
        { title: "address" },
        { title: "next_address" },
        { title: "time_from" },
        { title: "time_to" },
        { title: "duration" },
        { title: `distance_(km)` },
        { title: `distance_(mi)` },
        { title: `distance_(swedish_mi)` },
        { title: `fuel_used_(l)` },
        { title: `fuel_used_(gal)` },
        { title: `avg_speed_(km)` },
        { title: `avg_speed_(mi)` },
        { title: `avg_speed_(swedish_mi)` },
        { title: `fuel/km` },
        { title: `fuel/mi` },
        { title: `fuel/swedish_mi` },
    ]);
    const [orderListTotals,] = useState([
        { title: "object_name" },
        { title: "moving_time" },
        { title: `distance_(km)` },
        { title: `distance_(mi)` },
        { title: `distance_(swedish_mi)` },
        { title: `fuel_used_(l)` },
        { title: `fuel_used_(gal)` },
        { title: `avg_speed_(km)` },
        { title: `avg_speed_(mi)` },
        { title: `avg_speed_(swedish_mi)` },
        { title: `fuel/km` },
        { title: `fuel/mi` },
        { title: `fuel/swedish_mi` },
    ]);
    const [actionList,] = useState([
        { title: t("state") },
        { title: t("from") },
        { title: t("to") },
        { title: t("address") },
    ]);

    const defaultTrip: TripOnly = {
        address_from: '',
        address_to: '',
        route: '',
        lat_from: '',
        lon_from: '',
        lat_to: '',
        lon_to: '',
        time_from: '',
        time_to: '',
        duration: '00:00:00',
        stop_time: '00:00:00',
        distance: '0',
        avg_speed: 0,
        fuel_used: '0'
    };

    const addDistances = (distance1: string, distance2: string): string => {
        const distance1Number = parseFloat(distance1);
        const distance2Number = parseFloat(distance2);

        return (distance1Number + distance2Number).toFixed(3);
    };

    const addFuels = (fuel1: string, fuel2: string): string => {
        const distance1Number = parseFloat(fuel1);
        const distance2Number = parseFloat(fuel2);

        return (distance1Number + distance2Number).toFixed(3);
    };

    const parseDuration = (duration: string): number => {
        const daysMatch = duration.match(/(\d+) day(?:s)? /);
        const timeMatch = duration.match(/(\d+):(\d+):(\d+)/);

        let days = 0;
        let hours = 0;
        let minutes = 0;
        let seconds = 0;

        if (daysMatch) {
            days = parseInt(daysMatch[1], 10);
        }

        if (timeMatch) {
            hours = parseInt(timeMatch[1], 10);
            minutes = parseInt(timeMatch[2], 10);
            seconds = parseInt(timeMatch[3], 10);
        }

        // Convert total to seconds
        return (days * 24 * 3600) + (hours * 3600) + (minutes * 60) + seconds;
    };

    const secondsToDuration = (totalSeconds: number): string => {
        const days = Math.floor(totalSeconds / (24 * 3600));
        totalSeconds %= (24 * 3600);
        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        let duration = '';
        if (days > 0) {
            duration += `${days} day${days > 1 ? 's' : ''} `;
        }
        duration += `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        return duration.trim();
    };

    const addDurations = (duration1: string, duration2: string): string => {
        const seconds1 = parseDuration(duration1);
        const seconds2 = parseDuration(duration2);
        const totalSeconds = seconds1 + seconds2;

        return secondsToDuration(totalSeconds);
    };

    const processTripsOnly = (objects: any[]): TripOnly[] => {

        const result: TripOnly[] = [];
        let tempTrip = { ...defaultTrip };

        const updateTrip = (trip: TripOnly, object: any, isMoving: boolean) => {
            if (isMoving) {
                if (!trip.address_from) {
                    Object.assign(trip, {
                        address_from: object.address,
                        lat_from: object.lat,
                        lon_from: object.lon,
                        lat_to: object.next_lat,
                        lon_to: object.next_lon,
                        time_from: object.time_from,
                        time_to: object.time_to
                    });
                }
                trip.address_to = object.address;
            }
            trip.duration = addDurations(trip.duration, object.duration);
            trip.distance = addDistances(trip.distance, object.distance);
            trip.avg_speed = trip.avg_speed !== null && object.avg_speed !== null
                ? (trip.avg_speed + object.avg_speed) / 2
                : trip.avg_speed;
            trip.fuel_used = addFuels(trip.fuel_used, object.fuel_used);
            return trip;
        };

        objects.forEach((object, index) => {
            const isStationary = object.state === 'stationary';
            const isStationaryWithIgnition = object.state === 'stationary with ignition';
            const isMoving = object.state === 'moving';

            if (isStationary && index === 0) {
                tempTrip.distance = addDistances(tempTrip.distance, object.distance);
                tempTrip.fuel_used = addFuels(tempTrip.fuel_used, object.fuel_used);
            } else if (isStationaryWithIgnition) {
                tempTrip.distance = addDistances(tempTrip.distance, object.distance);
                tempTrip.stop_time = addDurations(tempTrip.stop_time, object.duration);
                tempTrip.fuel_used = addFuels(tempTrip.fuel_used, object.fuel_used);
            } else if (isMoving) {
                tempTrip = updateTrip(tempTrip, object, true);
            } else if (isStationary && index > 0) {
                tempTrip.address_to = object.address;
                tempTrip.distance = addDistances(tempTrip.distance, object.distance);
                tempTrip.stop_time = addDurations(tempTrip.stop_time, object.duration);
                tempTrip.fuel_used = addFuels(tempTrip.fuel_used, object.fuel_used);
                tempTrip.route = tempTrip.address_from + "<br />" + tempTrip.address_to;
                result.push(tempTrip);
                tempTrip = { ...defaultTrip };
            }
        });

        if (tempTrip.address_to) {
            tempTrip.route = tempTrip.address_from + " - " + tempTrip.address_to;
            result.push(tempTrip);
        }

        return result;
    };

    const exportReportPDF = (table: any, totals: any = null) => {
        toast.success(firstUpperLetter(t('processing')));
        const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "landscape" });
        let head: any[] = [];
        let data: any[] = [];

        table.getHeaderGroups().map((headerGroup: any) => {
            head.push(headerGroup.headers.map((header: any) => {
                return header.getContext().header.id;
            }));
        });

        table.getRowModel().rows.map((row: any) => {
            data.push(row.getVisibleCells().map((cell: any) => {
                if (String(cell.getContext().getValue()).includes("<br />")) {
                    const address = cell.getContext().getValue().split("<br />");
                    return address[0] + '\n' + address[1];
                }
                return String(cell.getContext().getValue());
            }));
        });

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        const logoBase64 = 'data:image/png;base64,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';
        doc.addImage(logoBase64, 'PNG', 10, 5, 35, 15);
        doc.setFontSize(24);
        doc.text(t('trip_and_stop'), 235, 15);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const date = new Date();
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        doc.text(`${firstUpperLetter(t('date'))}: ${formattedDate}`, 255, 20);
        let yTotals = 20;

        if (totals) {
            doc.setDrawColor(0);
            doc.setLineWidth(0.5);
            doc.line(10, 22, 285, 22);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(`${firstUpperLetter(t('totals'))}`, 10, 30);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            let count = 0;

            Object.values(totals[0]).map((item, index) => {
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

                if (item) {
                    doc.setFont('helvetica', 'bold');
                    doc.text(`${firstUpperLetter(Object.keys(totals[0])[index])}:`, xRow, yRow);
                    doc.setFont('helvetica', 'normal');
                    doc.text(`${item}`, xRow + 55, yRow);
                    count++;
                }
            });

            doc.setDrawColor(0);
            doc.setLineWidth(0.5);
            doc.line(10, yTotals + 5, 285, yTotals + 5);
        }

        autoTable(doc, {
            startY: yTotals + 10,
            head: head,
            body: data,
            bodyStyles: { fontStyle: 'bold' }
        });

        doc.save(t('trip_and_stop') + '.pdf');
    };

    const exportReportCSV = (table: any, totals: any = null) => {
        toast.success(firstUpperLetter(t('processing')));

        let headers: string[] = [];
        let rows: string[][] = [];

        table.getHeaderGroups().forEach((headerGroup: any) => {
            const headerRow = headerGroup.headers.map((header: any) => header.getContext().header.id);
            headers = headerRow;
        });

        table.getRowModel().rows.forEach((row: any) => {
            const rowData = row.getVisibleCells().map((cell: any) => {
                let value = String(cell.getContext().getValue());
                if (value.includes("<br />")) {
                    const address = value.split("<br />");
                    return address[0] + ' ' + address[1]; 
                }
                return value;
            });
            rows.push(rowData);
        });

        let csvContent = headers.join(",") + "\n"; 
        rows.forEach(row => {
            csvContent += row.map(cell => `"${cell}"`).join(",") + "\n"; 
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filterData = (objects: any[]) => {
        return objects.map(obj => {
            const newObj = { ...obj };
            if (newObj.address && newObj.next_address && newObj.state === 'moving') {
                const route = newObj.address + "<br />" + newObj.next_address;
                newObj.route = route;
            }
            if (newObj.time_from) {
                const time = format(newObj.time_from, `${dateFormat} ${timeFormat}`);
                newObj.time_from = String(time);
            }
            if (newObj.time_to) {
                const time = format(newObj.time_to, `${dateFormat} ${timeFormat}`);
                newObj.time_to = time;
            }
            if (newObj.duration) {
                newObj.duration = parseTimeString(newObj.duration, t);
            }
            if (newObj.distance) {
                newObj[`distance_(${unitDistance})`] = convertUnitDistance(Number(newObj.distance), unitDistance, t);
                delete newObj.distance;
            }
            if (newObj.fuel_used) {
                newObj[`fuel_used_(${unitVolume})`] = convertUnitVolume(Number(newObj.fuel_used), unitVolume, t);
                delete newObj.fuel_used;
            }
            if (newObj.avg_speed) {
                newObj[`avg_speed_(${unitDistance})`] = convertUnitDistance(Number(newObj.avg_speed), unitDistance, t);
                delete newObj.avg_speed;
            }
            if (newObj.fuel_km) {
                newObj[`fuel/${unitDistance}`] = convertUnitVolume(Number(newObj.fuel_km), unitVolume, t);
                delete newObj.fuel_km;
            }

            return reorderObject(newObj, orderListData);
        });
    };

    const filterTotals = (objects: any) => {
        const newObj = { ...objects };

        if (newObj.moving_time) {
            newObj.moving_time = parseTimeString(newObj.moving_time, t);
        }
        if (newObj.stationary_time) {
            newObj.stationary_time = parseTimeString(newObj.stationary_time, t);
        }
        if (newObj.moving_time_job) {
            newObj.moving_time_job = parseTimeString(newObj.moving_time_job, t);
        }
        if (newObj.stationary_time_job) {
            newObj.stationary_time_job = parseTimeString(newObj.stationary_time_job, t);
        }
        if (newObj.moving_time_private) {
            newObj.moving_time_private = parseTimeString(newObj.moving_time_private, t);
        }
        if (newObj.stationary_time_private) {
            newObj.stationary_time_private = parseTimeString(newObj.stationary_time_private, t);
        }
        if (newObj.distance) {
            newObj[`distance_(${unitDistance})`] = convertUnitDistance(Number(newObj.distance), unitDistance, t);
            delete newObj.distance;
        }
        if (newObj.fuel_used) {
            newObj[`fuel_used_(${unitVolume})`] = convertUnitVolume(Number(newObj.fuel_used), unitVolume, t);
            delete newObj.fuel_used;
        }
        if (newObj.avg_speed) {
            newObj[`avg_speed_(${unitDistance})`] = convertUnitDistance(Number(newObj.avg_speed), unitDistance, t);
            delete newObj.avg_speed;
        }
        if (newObj.fuel_km) {
            newObj[`fuel/${unitDistance}`] = convertUnitVolume(Number(newObj.fuel_km), unitVolume, t);
            delete newObj.fuel_km;
        }

        return reorderObject(newObj, orderListTotals);
    };

    useEffect(() => {
        if (settings.length > 0) {
            settings.map((setting) => {
                if (setting.title === "time_format") {
                    setTimeFormat(setting.value);
                }
                if (setting.title === "unit_distance") {
                    setUnitDistance(setting.value)
                }
                if (setting.title === "unit_volume") {
                    setUnitVolume(setting.value)
                }
                if (setting.title === "date_format") {
                    setDateFormat(setting.value)
                }
            })
        }
    }, [settings]);

    useEffect(() => {
        const fetchData = async () => {
            if (user.token) {
                try {
                    const dataObjectList = await objectList(getUserRef().token);
                    setDataObjectList(dataObjectList);
                } catch (error) {
                    console.error('Error fetching client info:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [user.token]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user.token || !vehicle || !startDate || !endDate || !isGenerate) {
                return;
            }

            try {
                toast.success(firstUpperLetter(t('processing')));
                const tripsStops = reportType === t('trip_only') ? 1 : reportType === t('stop_only') ? 2 : 3;
                const params = {
                    "object_id": vehicle,
                    "time_from": format(startDate, "yyyy-MM-dd HH:mm:ss"),
                    "time_to": format(endDate, "yyyy-MM-dd HH:mm:ss"),
                    "trips_stops": tripsStops,
                    ...(minMoving && { "min_moving": Number(minMoving) }),
                    ...(minStationary && { "min_stationary": Number(minStationary) }),
                    ...(tripMode && { "trip_mode": Number(tripMode) }),
                    ...(schedules && schedules.length > 0 && { "time_ranges": schedules }),
                }
                const dataObjectTripStop = await objectTripStop(getUserRef().token, params);
                const dataObjectTripStopAddresses = await fetchAddresses(getUserRef().token, dataObjectTripStop.data);
                const dataObjectTripStopClean = cleanObjectsColumns(dataObjectTripStopAddresses);
                setDataObjectTripStopClean(dataObjectTripStopClean);
                if (dataObjectTripStop.totals) {
                    const dataObjectTripStopFilters = filterTotals(dataObjectTripStop.totals);
                    const dataObjectTripTranslate = translateObjects([dataObjectTripStopFilters], t, ["moving_time", "stationary_time"]);
                    setDataObjectTripStopTotals(dataObjectTripTranslate);
                }
                if (tripsStops === 1) {
                    //const dataObjectTripOnly = processTripsOnly(dataObjectTripStopClean);
                    const dataObjectTripStopFilters = filterData(dataObjectTripStopClean);
                    const dataObjectTripTranslate = translateObjects(dataObjectTripStopFilters, t, ["duration"]);
                    setDataObjectTripStop(dataObjectTripTranslate);
                }
                else {
                    const dataObjectTripStopFilters = filterData(dataObjectTripStopClean);
                    const dataObjectTripTranslate = translateObjects(dataObjectTripStopFilters, t, ["duration"]);
                    setDataObjectTripStop(dataObjectTripTranslate);
                }

            } catch (error) {
                toast.error(firstUpperLetter(t('process_error')));
                console.error('Error fetching client info:', error);
            } finally {
                toast.success(firstUpperLetter(t('process_completed')));
                setGenerate(false);
                setRefresh(false);
            }
        };

        fetchData();
    }, [user.token, vehicle, startDate, endDate, isGenerate, reportType]);

    /*     useEffect(() => {
            const fetchData = async () => {
                const tripsStops = reportType === t('trip_only') ? 1 : reportType === t('stop_only') ? 2 : 3;
    
                if (!dataObjectTripStopClean) {
                    return;
                }
                if (reportType === t('trip_only')) {
                    const dataObjectTripOnly = processTripsOnly(dataObjectTripStopClean);
                    const dataObjectTripStopFilters = filterData(dataObjectTripOnly);
                    const dataObjectTripTranslate = translateObjects(dataObjectTripStopFilters, t);
                    setDataObjectTripStop(dataObjectTripTranslate);
                }
                else if (reportType === t('stop_only')) {
                    const dataObjectTripStopFilters = filterData(dataObjectTripStopClean);
                    const dataObjectTripTranslate = translateObjects(dataObjectTripStopFilters, t);
                    setDataObjectTripStop(dataObjectTripTranslate);
                }
                else {
                    const dataObjectTripStopFilters = filterData(dataObjectTripStopClean);
                    const dataObjectTripTranslate = translateObjects(dataObjectTripStopFilters, t);
                    setDataObjectTripStop(dataObjectTripTranslate);
                } 
            };
    
            fetchData();
        }, [reportType, dataObjectTripStopClean]); */


    return {
        models: {
            user,
            settings,
            isLoading,
            isGenerate,
            isRefresh,
            dataObjectList,
            dataObjectTripStop,
            ignoreList,
            styleColumnList,
            searchList,
            groupList,
            vehicle,
            startDate,
            endDate,
            dataObjectTripStopTotals,
            defaultReportType,
            reportType,
            reportTypeList,
            schedules,
            minMoving,
            minStationary,
            tripMode,
            actionList
        },
        operations: {
            setVehicle,
            setStartDate,
            setEndDate,
            setGenerate,
            translateObjects,
            exportReportPDF,
            setReportType,
            setSchedules,
            setMinMoving,
            setMinStationary,
            setTripMode,
            exportReportCSV
        }
    };
};