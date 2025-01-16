"use client";
import { controller } from "./controller";
import { Button } from "@/components/ui/button";
import LayoutLoader from "@/components/layout-loader";
import AdvancedTable from "@/components/partials/advanced";
import { useTranslation } from 'react-i18next';
import DatePickerWithRange from "@/components/partials/pickers/date-picker-with-range";
import DataTableRowOptions from "./components/data-table-row-options"
import DataTableBulkOptions from "./components/data-table-bulk-options"
import SettingsPickers from "./components/settings-picker";
import UploadFiles from "./components/upload-files";

const Tachograph = () => {
  const { t } = useTranslation();
  const { models, operations } = controller();

  if (!models.user || models.isLoading) {
    return <LayoutLoader />;
  }

  const pickers = () => {
    return <>
      <div className="flex flex-col lg:flex-row justify-start gap-2">
        <DatePickerWithRange
          setStartDate={operations.setStartDate}
          setEndDate={operations.setEndDate}
          startDate={models.startDate}
          endDate={models.endDate}
          settings={models.settings}
        />
        <SettingsPickers
          reportType={models.reportType}
          reportTypeList={models.reportTypeList}
          setReportType={operations.setReportType}
          dataSource={models.dataSource}
          dataSourceList={models.dataSourceList}
          setDataSource={operations.setDataSource}
          penalties={models.penalties}
          penaltiesList={models.penaltiesList}
          setPenalties={operations.setPenalties}
          cultures={models.cultures}
          culturesList={models.culturesList}
          setCultures={operations.setCultures}
          timeZone={models.timeZone}
          timeZoneList={models.timeZoneList}
          setTimeZone={operations.setTimeZone}
        />
        <Button
          variant="outline"
          color="success"
          size="sm"
          className="h-8"
          disabled={models.isGenerate || !models.startDate || !models.endDate}
          onClick={() => (operations.setGenerate(true))}
        >
          <span className='capitalize'>{models.isGenerate ? t('generating') : t('generate')}</span>
        </Button>
        {/* <UploadFiles
          handleUploadFilesChange={operations.handleUploadFilesChange}
          uploadingFiles={models.uploadingFiles}
          handleUploadFiles={operations.handleUploadFiles}
        /> */}
      </div>
    </>
  }

  const options = (row: any) => {
    return <>
      <DataTableRowOptions
        row={row}
        getDriverReport={models.getDriverReport}
        setGetDriverReport={operations.setGetDriverReport}
        statusActive={models.statusActive}
        setStatusActive={operations.setStatusActive}
      />
    </>
  }

  const bulk = (rows: any) => {
    return <>
      <DataTableBulkOptions
        rows={rows}
        getDriverBulkReport={models.getDriverBulkReport}
        setGetDriverBulkReport={operations.setGetDriverBulkReport}
        statusActiveBulk={models.statusActiveBulk}
        setStatusActiveBulk={operations.setStatusActiveBulk}
      />
    </>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12gap-6">
        <div className="col-span-12 lg:col-span-12 overflow-x-auto">
          <AdvancedTable
            ifSelect
            ifSearch
            dataList={models.dataList}
            ignoreList={models.ignoreList}
            searchList={models.searchList}
            pickers={pickers}
            options={options}
            bulk={bulk}
          />
        </div>
      </div>
    </div>
  );
};

export default Tachograph;
