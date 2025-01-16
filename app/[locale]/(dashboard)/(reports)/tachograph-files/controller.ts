
"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { cleanObjectsColumns, firstUpperLetter } from "@/lib/utils";
import { useTranslation } from 'react-i18next';
import {
  tachoFilesList,
  tachoDriverCardFilesList,
  tachoPutRawFile
} from "@/models/tachograph";
import toast from "react-hot-toast";

export const controller = () => {
  const { t } = useTranslation();
  const UserContext = useUser();
  const { user, settings } = UserContext.models;
  const { getUserRef } = UserContext.operations;
  const [isLoading, setLoading] = useState(true);
  const [isGenerate, setGenerate] = useState(false);
  const [unitDistance, setUnitDistance] = useState(settings.find(setting => setting.title === "unit_distance")?.value);
  const [unitVolume, setUnitVolume] = useState(settings.find(setting => setting.title === "unit_volume")?.value);
  const [dateFormat, setDateFormat] = useState(settings.find(setting => setting.title === "date_format")?.value);
  const [timeFormat, setTimeFormat] = useState(settings.find(setting => setting.title === "time_format")?.value);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [dataTachoFilesList, setDataTachoFilesList] = useState([]);
  const [dataTachoDriverCardFilesList, setDataTachoDriverCardFilesList] = useState([]);

  const handleUploadFilesChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = selectedFiles.filter((file: File) =>
      file.name.endsWith(".ddd")
    );
    if (validFiles.length !== selectedFiles.length) {
      toast.success(firstUpperLetter(t("files_have_to_be_ddd")));
    }
    setUploadFiles(validFiles);
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
        (async () => {
          try {
            const params = {

            };
            const dataTachoFilesList = await tachoFilesList(getUserRef().token, params);
            console.log("tachoFileList: ", dataTachoFilesList);
            const dataTachoFilesListClean = cleanObjectsColumns(dataTachoFilesList);
            console.log("dataTachoFilesListClean: ", dataTachoFilesListClean);
            setDataTachoFilesList(dataTachoFilesListClean);
            const dataTachoDriverCardFilesList = await tachoDriverCardFilesList(getUserRef().token, params);
            console.log("dataTachoDriverCardFilesList: ", dataTachoDriverCardFilesList); 
            const dataTachoDriverCardFilesListClean = cleanObjectsColumns(dataTachoDriverCardFilesList);
            setDataTachoDriverCardFilesList(dataTachoDriverCardFilesListClean);
            /*             console.log("tachoFileList: ", dataTachoFilesList);
                        console.log("dataTachoDriverCardFilesList: ", dataTachoDriverCardFilesList); */
            setLoading(false);
          } catch (error) {
            console.error('Error authorizing service:', error);
          }
        })();
      }
    }

    fetchData();
  }, [user.token, isGenerate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user.token || !uploadFiles || !isGenerate) {
        return;
      }

      try {
        if (uploadFiles.length === 0) {
          toast.success(firstUpperLetter(t("no_files")));
          return;
        }
        toast.success(firstUpperLetter(t('processing')));
        for (const file of uploadFiles) {
          const fileData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                resolve(reader.result.split(",")[1]);
              } /* else {
                reject(new Error("El resultado del archivo no es una cadena."));
              } */
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
          });

          const params = {
            "file_data": fileData,
          };
          await tachoPutRawFile(getUserRef().token, params);
        }
      } catch (error) {
        toast.error(firstUpperLetter(t('process_error')));
        console.error('Error fetching client info:', error);
      } finally {
        toast.success(firstUpperLetter(t('process_completed')));
        setUploadFiles([]);
        setGenerate(false);
      }
    };

    fetchData();
  }, [isGenerate]);

  return {
    models: {
      user,
      settings,
      isLoading,
      isGenerate,
      uploadFiles,
      dataTachoFilesList,
      dataTachoDriverCardFilesList
    },
    operations: {
      setGenerate,
      handleUploadFilesChange,
    }
  };
};
