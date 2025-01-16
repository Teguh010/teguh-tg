"use client";
import { controller } from "./controller";
import LayoutLoader from "@/components/layout-loader";
import TableLoader from "@/components/table-loader";
import AdvancedTable from "@/components/partials/advanced";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import TransportModeSelect from "./components/custom-seleect";

const ObjectOverview = () => {
  const { t } = useTranslation();
  const { models, operations } = controller();
  const user = models.user;

  if (!user) {
    return <LayoutLoader />;
  }

  const hasData = models.dataGenerated && models.filteredObjectList?.length > 0;

  const pickers = () => {
    return (
      <div className="flex flex-col lg:flex-row justify-start gap-2">
        <Button
          variant="outline"
          size="sm"
          className={"h-8"}
          disabled={!hasData}
          onClick={() => (models.fastFilter === false ? operations.setFastFilter(true) : operations.setFastFilter(false))}
        >
          <span className='capitalize'>{t('fast_filter')}</span>
        </Button>

        <TransportModeSelect
          value={models.selectedGroup?.toString() || ""}
          onChange={(value) => operations.setSelectedGroup(value ? parseInt(value) : null)}
          options={[
            { value: "", label: t('All Groups') },
            ...(models.groupList?.map((group) => ({
              value: group.id.toString(),
              label: group.val
            })) || [])
          ]}
          placeholder={t('select_group')}
        />

        <Button
          variant='outline'
          color='success'
          size='sm'
          className='h-8'
          disabled={models.isGenerate}
          onClick={() => operations.setGenerate(true)}
        >
          <span className='capitalize'>
            {models.isGenerate ? t('generating') : t('generate')}
          </span>
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-12 overflow-x-auto">
          <AdvancedTable
            dataList={models.dataGenerated ? models.filteredObjectList : []}
            ignoreList={models.ignoreList}
            styleColumnList={models.styleColumnList}
            pickers={pickers}
            ifPagination={hasData}
          />
        </div>
      </div>
    </div>
  );
};

export default ObjectOverview;
