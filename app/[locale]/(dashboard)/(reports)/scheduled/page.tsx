"use client";
import { controller } from "./controller";
import { Button } from "@/components/ui/button";
import ReportTypePicker from "@/components/partials/pickers/report-type-picker";
import LayoutLoader from "@/components/layout-loader";
import AdvancedTable from "@/components/partials/advanced";
import DataTableRowActions from "./components/data-table-row-address";
import { useTranslation } from 'react-i18next';
import AddScheduledTripStopReport from "./components/add-scheduled-trip-stop-report";
import Card from "@/components/ui/card-snippet";


const ObjectOverview = () => {
  const { t } = useTranslation();
  const { models, operations } = controller();

  if (!models.user || models.isLoading) {
    return <LayoutLoader />;
  }

  const pickers = () => {
    return <>
      <div className="flex flex-col lg:flex-row justify-start gap-2">
        <ReportTypePicker
          defaultReportType={models.defaultReportType}
          reportType={models.reportType}
          reportTypes={models.reportTypeList}
          setReportType={operations.setReportType}
        />
        <Button
          variant="outline"
          color="success"
          size="sm"
          className="h-8"
          disabled={models.isCreate || !models.reportType}
          onClick={() => (operations.setCreate(true))}
        >
          <span className='capitalize'>{models.isCreate ? t('generating') : t('generate')}</span>
        </Button>
      </div>
    </>
  }

  const actions = (row: any, key: any) => {
    return <DataTableRowActions row={row} name={key} />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12gap-6">
        <div className="col-span-12 lg:col-span-12 overflow-x-auto">
          {models.isCreate ?
            <Card title="Basic" >
              <AddScheduledTripStopReport setCreate={operations.setCreate} stepList={models.stepList} />
            </Card> :
            <AdvancedTable
              //dataList={models.dataObjectTripStop}
              pickers={pickers}
              actions={actions}
            />}
        </div>
      </div>
    </div>
  );
};

export default ObjectOverview;
