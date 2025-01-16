// src/lib/historyFilters.ts

import { format } from 'date-fns';
import { convertUnitDistance, convertUnitVolume, parseTimeString } from '@/lib/utils';

// Fungsi untuk memfilter data perjalanan atau pemberhentian kendaraan
export const filterData = (objects: any[], dateFormat: string, timeFormat: string, unitDistance: string, unitVolume: string, t: (key: string) => string) => {
    return objects.map((obj) => {
        const newObj = { ...obj };
        if (newObj.time_from) {
            newObj.time_from = format(newObj.time_from, `${dateFormat} ${timeFormat}`);
        }
        if (newObj.time_to) {
            newObj.time_to = format(newObj.time_to, `${dateFormat} ${timeFormat}`);
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
        return newObj;
    });
};

// Fungsi untuk memfilter data ringkasan (totals)
export const filterTotals = (objects: any, unitDistance: string, unitVolume: string, t: (key: string) => string) => {
    const newObj = { ...objects };
    if (newObj.moving_time) {
        newObj.moving_time = parseTimeString(newObj.moving_time, t);
    }
    if (newObj.stationary_time) {
        newObj.stationary_time = parseTimeString(newObj.stationary_time, t);
    }
    if (newObj.distance) {
        newObj[`distance_(${unitDistance})`] = convertUnitDistance(Number(newObj.distance), unitDistance, t);
        delete newObj.distance;
    }
    if (newObj.fuel_used) {
        newObj[`fuel_used_(${unitVolume})`] = convertUnitVolume(Number(newObj.fuel_used), unitVolume, t);
        delete newObj.fuel_used;
    }
    return newObj;
};

// Fungsi untuk memfilter data trajektori kendaraan
export const filterTrajectoryData = (objects: any[], dateFormat: string, timeFormat: string, unitDistance: string, t: (key: string) => string) => {
    return objects.map((obj) => {
        const newObj = { ...obj };
        if (newObj.time) {
            newObj.time = format(newObj.time, `${dateFormat} ${timeFormat}`);
        }
        if (newObj.spd !== null && typeof newObj.spd === 'number') {
            newObj.spd = convertUnitDistance(Number(newObj.spd), unitDistance, t);
        }
        return newObj;
    });
};
