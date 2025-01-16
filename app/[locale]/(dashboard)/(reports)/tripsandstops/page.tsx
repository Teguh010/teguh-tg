"use client";
import { useEffect, useState } from 'react';
import { controller } from "./controller";
import { Button } from "@/components/ui/button";
import { DataTableFacetedFilter } from "./components/data-table-faceted-filter";
import DatePickerWithRange from "@/components/partials/pickers/date-picker-with-range";
import VehiclePicker from "@/components/partials/pickers/vehicle-picker";
import ReportTypePicker from "@/components/partials/pickers/report-type-picker";
import Totals from "./components/totals";
import LayoutLoader from "@/components/layout-loader";
import AdvancedTable from "@/components/partials/advanced";
import DataTableRowActions from "./components/data-table-row-address";
import loadHereMaps from '@/components/maps/here-map/utils/here-map-loader';
import { useTranslation } from 'react-i18next';
import { SettingsPicker } from "./components/settings-picker";
import { ExportPicker } from "./components/export-picker";

const ObjectOverview = () => {
  const { t } = useTranslation();
  const [mapLoaded, setMapLoaded] = useState(false);
  const { models, operations } = controller();
  const [focusLocation, setFocusLocation] = useState({ 
    fromLat: null, 
    fromLon: null,
    toLat: null,
    toLon: null,
    activeRow: null,
    activeColumn: 'from',
    fromClick: false,
    activeFromRow: null
  });
  const [activeRowId, setActiveRowId] = useState(null)

  useEffect(() => {
    loadHereMaps(() => setMapLoaded(true));
  }, []);

  useEffect(() => {
    setFocusLocation({ 
      fromLat: null, 
      fromLon: null,
      toLat: null,
      toLon: null,
      activeRow: null,
      activeColumn: models.reportType === 'stop only' ? 'address' : 'from',
      fromClick: false,
      activeFromRow: null
    });
  }, [models.reportType]);

  if (!models.user || models.isLoading || !models.dataObjectList || !mapLoaded) {
    return <LayoutLoader />;
  }

  const pickers = (table: any = undefined) => {
    return <>
      <div className="flex flex-col lg:flex-row justify-start gap-2 flex-wrap">
        <VehiclePicker
          vehicles={models.dataObjectList}
          setVehicle={operations.setVehicle}
        />
        <ReportTypePicker
          defaultReportType={models.defaultReportType}
          reportType={models.reportType}
          reportTypes={models.reportTypeList}
          setReportType={operations.setReportType}
        />
        <DatePickerWithRange
          setStartDate={operations.setStartDate}
          setEndDate={operations.setEndDate}
          startDate={models.startDate}
          endDate={models.endDate}
          settings={models.settings}
        />
        <SettingsPicker
          settings={models.settings}
          schedules={models.schedules}
          setSchedules={operations.setSchedules}
          minMoving={models.minMoving}
          minStationary={models.minStationary}
          tripMode={models.tripMode}
          setMinMoving={operations.setMinMoving}
          setMinStationary={operations.setMinStationary}
          setTripMode={operations.setTripMode}
        />
        <Button
          variant="outline"
          color="success"
          size="sm"
          className="h-8"
          disabled={models.isGenerate || !models.vehicle || !models.startDate || !models.endDate}
          onClick={() => (operations.setGenerate(true))}
        >
          <span className='capitalize'>{models.isGenerate ? t('generating') : t('generate')}</span>
        </Button>
        <ExportPicker
          exportReportPDF={operations.exportReportPDF}
          exportReportCSV={operations.exportReportCSV}
          table={table}
          dataObjectTripStopTotals={models.dataObjectTripStopTotals}
        />
        {/* <Button
          variant="outline"
          color="destructive"
          size="sm"
          className="h-8"
          disabled={table.getRowModel().rows.length <= 0}
          onClick={() => (operations.exportReportPDF(table, Object.keys(models.dataObjectTripStopTotals).length > 0 ? models.dataObjectTripStopTotals : null))}
        >
          <span className='capitalize'>{t('export_pdf')}</span>
        </Button>
        <Button
          variant="outline"
          color="destructive"
          size="sm"
          className="h-8"
          disabled={table.getRowModel().rows.length <= 0}
          onClick={() => (operations.exportReportCSV(table, Object.keys(models.dataObjectTripStopTotals).length > 0 ? models.dataObjectTripStopTotals : null))}
        >
          <span className='capitalize'>{t('export_csv')}</span>
        </Button> */}
      </div>
    </>
  }

  const exports = (table: any) => {
    return <>
      <div className="flex flex-col lg:flex-row justify-start gap-2 lg:pl-2">
        <Button
          variant="outline"
          color="destructive"
          size="sm"
          className="h-8"
          disabled={table.getRowModel().rows.length <= 0}
          onClick={() => (operations.exportReportPDF(table, Object.keys(models.dataObjectTripStopTotals).length > 0 ? models.dataObjectTripStopTotals : null))}
        >
          <span className='capitalize'>{t('export_pdf')}</span>
        </Button>
      </div>
    </>
  }

  const groups = (table: any) => {
    return <>
      {table.getRowModel().rows.length > 0 &&
        <div className="gap-2 mr-2 flex flex-row">
          {models.groupList.map((group, index) => {
            return table.getColumn(t(group.title)) && (
              <DataTableFacetedFilter
                key={index}
                column={table.getColumn(t(group.title))}
                title={t('state')}
                options={group.values}
              />
            )
          })}
        </div>
      }
    </>
  }

  const handleLocationClick = (rowId, type, lat, lon) => {
      
    if (models.reportType === 'stop only') {
        setFocusLocation({
            fromLat: lat,
            fromLon: lon,
            toLat: null,
            toLon: null,
            activeRow: rowId,
            activeColumn: 'address',
            fromClick: true,
            activeFromRow: rowId
        });
    } else {
        if (type === 'from') {
            setFocusLocation({
                fromLat: lat,
                fromLon: lon,
                toLat: null,
                toLon: null,
                activeRow: rowId,
                activeColumn: 'from',
                fromClick: true,
                activeFromRow: rowId
            });
        } else if (type === 'to') {
            setFocusLocation({
                fromLat: focusLocation.fromLat,
                fromLon: focusLocation.fromLon,
                toLat: lat,
                toLon: lon,
                activeRow: rowId,
                activeColumn: 'to',
                fromClick: true,
                activeFromRow: focusLocation.activeFromRow
            });
        }
    }

  }

  const actions = (row: any, key: any) => {
    const getStateColor = (state) => {
      if (state === 'moving') return 'bg-green-500'
      return 'bg-blue-500'
    }

    const numberBadge = (
      <span className={`w-5 h-5 mr-3 rounded-full flex items-center justify-center text-xs text-white
        ${getStateColor(row.original.state)}`}>
        {Number(row.id) + 1}
      </span>
    )

    if (key === t('state')) {
      return (
        <div className="flex items-center gap-2">
          {numberBadge}
          <span className="capitalize">{row.original.state}</span>
        </div>
      )
    }

    if (key === t('from')) {
      return (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            className={`capitalize p-1 h-5 ${
              (focusLocation.activeRow === row.id && focusLocation.activeColumn === 'from') ||
              (focusLocation.activeFromRow === row.id)
                ? 'bg-blue-100' 
                : ''
            }`}
            onClick={() => handleLocationClick(
              row.id,
              'from',
              row.original[t('lat')], 
              row.original[t('lon')]
            )}
          >
            {row.original[t('from')]}
          </Button>
        </div>
      )
    }
    if (key === t('to')) {
      return (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            className={`capitalize p-1 h-5 ${
              focusLocation.activeRow === row.id && focusLocation.activeColumn === 'to'
                ? 'bg-blue-100' 
                : ''
            }`}
            onClick={() => handleLocationClick(
              row.id,
              'to',
              row.original[t('next_lat')], 
              row.original[t('next_lon')]
            )}
          >
            {row.original[t('to')]}
          </Button>
        </div>
      )
    }
    if (key === t('address')) {
      return (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            className={`capitalize p-1 h-5 ${
              focusLocation.activeRow === row.id && focusLocation.activeColumn === 'address'
                ? 'bg-blue-100' 
                : ''
            }`}
            onClick={() => handleLocationClick(
              row.id,
              'address',
              row.original[t('lat')], 
              row.original[t('lon')]
            )}
          >
            {row.original[t('address')]}
          </Button>
        </div>
      )
    }
    if (key === '#') {
      return numberBadge
    }
    return null
  }

  const handleMarkerClick = (location) => {    
    models.dataObjectTripStop.forEach((row, index) => {
        if (models.reportType === t('stop_only')) {
            if (row.lat === location.lat && row.lon === location.lon) {
                setFocusLocation({
                    fromLat: location.lat,
                    fromLon: location.lon,
                    toLat: null,
                    toLon: null,
                    activeRow: String(index),
                    activeColumn: 'address',
                    fromClick: false,
                    activeFromRow: String(index)
                })
            }
        } 
        else {
            if (row.lat === location.lat && row.lon === location.lon) {
                setFocusLocation({
                    fromLat: location.lat,
                    fromLon: location.lon,
                    toLat: null,
                    toLon: null,
                    activeRow: String(index),
                    activeColumn: 'from',
                    fromClick: false,
                    activeFromRow: String(index)
                })
            } else if (row.next_lat === location.lat && row.next_lon === location.lon) {
                setFocusLocation({
                    fromLat: null,
                    fromLon: null,
                    toLat: location.lat,
                    toLon: location.lon,
                    activeRow: String(index),
                    activeColumn: 'to',
                    fromClick: false,
                    activeFromRow: focusLocation.activeFromRow
                })
            }
        }
    })
  }

  const totals = () => {
    return (
      <div className="lg:w-full">
        <Totals 
          totals={models.dataObjectTripStopTotals} 
          tripData={models.dataObjectTripStop}
          focusLocation={focusLocation}
          onMarkerClick={handleMarkerClick}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12gap-6">
        <div className="col-span-12 lg:col-span-12 overflow-x-auto">
          <AdvancedTable
            dataList={models.dataObjectTripStop}
            ignoreList={models.ignoreList}
            actionList={models.actionList}
            styleColumnList={models.styleColumnList}
            pickers={pickers}
            //exports={exports}
            /*  groups={models.dataObjectTripStop[0]?.state ? groups : null} */
            actions={actions}
            totals={Object.keys(models.dataObjectTripStopTotals).length > 0 ? totals : null}
          />
        </div>
      </div>
    </div>
  );
};

export default ObjectOverview;
