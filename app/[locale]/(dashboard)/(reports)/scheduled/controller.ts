
"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { translateObjects } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

export const controller = () => {
    const { t } = useTranslation();
    const UserContext = useUser();
    const { user, settings } = UserContext.models;
    const { getUserRef } = UserContext.operations;
    const [dataObjectList, setDataObjectList] = useState(null);
    const [isCreate, setCreate] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [unitDistance, setUnitDistance] = useState(settings.find(setting => setting.title === "unit_distance")?.value);
    const [unitVolume, setUnitVolume] = useState(settings.find(setting => setting.title === "unit_volume")?.value);
    const [dateFormat, setDateFormat] = useState(settings.find(setting => setting.title === "date_format")?.value);
    const [timeFormat, setTimeFormat] = useState(settings.find(setting => setting.title === "time_format")?.value);
    const defaultReportType = '';
    const [reportType, setReportType] = useState(defaultReportType);
    const [reportTypeList,] = useState([
        { title: t('scheduled_trip_stop_report') },
    ]);
    const [stepList, setStepList] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (user.token) {
                setLoading(false);
               /*  try {
                    const dataObjectList = await objectList(getUserRef().token);
                    setDataObjectList(dataObjectList.items);
                } catch (error) {
                    console.error('Error fetching client info:', error);
                } finally {
                    setLoading(false);
                } */
            }
        };

        fetchData();
    }, [user.token]);

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
            if (reportType === t('scheduled_trip_stop_report')) {
                setStepList([
                    {
                        title: t("scheduler_configuration"),
                        fields: [
                            { name: t('name'), placeholder: t("name"), type: "text" },
                            { name: t('is_repeatable'), type: "checkbox" },
                            { name: t('repeat_step'), placeholder: t("repeat_step"), type: "number" },
                            { name: t('name'), type: "checkbox" },
                            { name: t('repeat_count'), placeholder: t("repeat_count"), type: "number" },
                            { name: t('start_date'), type: "date" },
                            { name: t('repeat'), type: "select", options: [t("every_day"), t("every_week")] },
                            { type: "select", options: [t("disabled"), t("enabled")] },
                            { name: t('recipient_email'), placeholder: t("recipient_email"), type: "text" },
                        ]
                    },
                    {
                        title: t("scheduler_configuration2"),
                        fields: [
                            { name: t("name"), type: "text" },
                            { name: t("is_repeatable"), type: "boolean" },
                            { name: t("repeat_step"), type: "number" },
                            { name: t("repeat_count"), type: "boolean" },
                            { name: t("repeat_count"), type: "number" },
                        ]
                    },
                ])
            }
        };

        fetchData();
    }, [isCreate]);

    return {
        models: {
            user,
            settings,
            isLoading,
            isCreate,
            dataObjectList,
            defaultReportType,
            reportType,
            reportTypeList,
            stepList
        },
        operations: {
            setReportType,
            setCreate
        }
    };
};
