"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

const DataTableRowActions = ({ row, onLocationClick }) => {
  const { t } = useTranslation();

  const handleLocationClick = () => {
    const lat = row.original[t('lat')]
    const lon = row.original[t('lon')]
    onLocationClick(lat, lon)
  }

  return (
    <Button
      variant="ghost"
      className="flex h-8 w-auto p-2"
      onClick={handleLocationClick}
    >
      {row.original[t('address')]}
    </Button>
  );
};

export default React.memo(DataTableRowActions);