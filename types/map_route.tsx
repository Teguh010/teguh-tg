// /type/map_route.ts

export interface SettingsFormProps {
  // **Existing Props**
  transportMode: string;
  setTransportMode: (mode: string) => void;
  truckHeight: number;
  setTruckHeight: (height: number) => void;
  truckGrossWeight: number;
  setTruckGrossWeight: (weight: number) => void;
  truckWeightPerAxle: number;
  setTruckWeightPerAxle: (weight: number) => void;
  smallTruckHeight: number;
  setSmallTruckHeight: (height: number) => void;
  smallTruckGrossWeight: number;
  setSmallTruckGrossWeight: (weight: number) => void;
  smallTruckWeightPerAxle: number;
  setSmallTruckWeightPerAxle: (weight: number) => void;
  fetchRouteFromHereAPI: () => void;
  startLocation: { lat: number; lon: number } | null;
  endLocation: { lat: number; lon: number } | null;
  emissionType: string;
  setEmissionType: (value: string) => void;
  co2Class: string;
  setCo2Class: (value: string) => void;

  // **New Props**
  trailerType: string;
  setTrailerType: (value: string) => void;
  trailersCount: string;
  setTrailersCount: (value: string) => void;
  trailerNumberAxles: string;
  setTrailerNumberAxles: (value: string) => void;
  hybrid: string;
  setHybrid: (value: string) => void;
  height: string;
  setHeight: (value: string) => void;
  trailerHeight: string;
  setTrailerHeight: (value: string) => void;
  vehicleWeight: string;
  setVehicleWeight: (value: string) => void;
  passengersCount: string;
  setPassengersCount: (value: string) => void;
  tiresCount: string;
  setTiresCount: (value: string) => void;
  commercial: string;
  setCommercial: (value: string) => void;
  shippedHazardousGoods: string;
  setShippedHazardousGoods: (value: string) => void;
  heightAbove1stAxle: string;
  setHeightAbove1stAxle: (value: string) => void;
  length: string;
  setLength: (value: string) => void;
  fuelType: string;
  setFuelType: (value: string) => void;
  trailerWeight: string;
  setTrailerWeight: (value: string) => void;
}
