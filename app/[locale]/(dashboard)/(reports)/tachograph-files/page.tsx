"use client";
import { Button } from "@/components/ui/button";
import { controller } from "./controller";
import LayoutLoader from "@/components/layout-loader";
import AdvancedTable from "@/components/partials/advanced";
import { useTranslation } from 'react-i18next';
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
        <UploadFiles
          handleUploadFilesChange={operations.handleUploadFilesChange}
        />
        <Button
          variant="outline"
          color="success"
          size="sm"
          className="h-8"
          disabled={models.isGenerate || models.uploadFiles.length === 0}
          onClick={() => (operations.setGenerate(true))}
        >
          <span className='capitalize'>{models.isGenerate ? t('uploading') : t('upload')}</span>
        </Button>
      </div>
    </>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-12 overflow-x-auto">
          <AdvancedTable
            pickers={pickers}
            dataList={models.dataTachoFilesList}
          />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-12 overflow-x-auto">
          <AdvancedTable
            dataList={models.dataTachoDriverCardFilesList}
          />
        </div>
      </div>
    </div>
  );
};

export default Tachograph;
