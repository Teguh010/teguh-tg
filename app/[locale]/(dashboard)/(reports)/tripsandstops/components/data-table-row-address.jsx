"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

const DataTableRowActions = ({ row, name }) => {
  const { t } = useTranslation();

  const handleClick = () => {
    // Akan dihandle oleh parent component untuk fokus ke map
    if (name === t('from')) {
      return {
        lat: row.original[t('lat')],
        lon: row.original[t('lon')]
      }
    }
    if (name === t('to')) {
      return {
        lat: row.original[t('next_lat')],
        lon: row.original[t('next_lon')]
      }
    }
    if (name === t('address')) {
      return {
        lat: row.original[t('lat')],
        lon: row.original[t('lon')]
      }
    }
  }

  return (
    <>
      {name === t('from') || name === t('to') || name === t('address') ? (
        <Button 
          variant="ghost" 
          className="capitalize p-1 h-5"
          onClick={handleClick}
        >
          {name === t('from') && row.original[t('from')]}
          {name === t('to') && row.original[t('to')]}
          {name === t('address') && row.original[t('address')]}
        </Button>
      ) : null}
    </>
  );
};

export default React.memo(DataTableRowActions);
