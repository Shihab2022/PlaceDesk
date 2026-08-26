// @ts-nocheck
import {
  IconLayer,
  PolygonLayer,
  ScatterplotLayer,
  HeatmapLayer,
} from "deck.gl";

export const BRANDED = "branded";
export const UNBRANDED = "unbranded";
export const DELIVERY = "delivery";
export const DINING = "dining";
export const DELIVERY_ONLY = "delivery-only";
export const INDUSTRY_TOP = "Industry Top";
export const NOT_AVAILABLE = "Not Available";
export const VALUE = "Value";
export const VALUE_PREMIUM = "Mid-Market";
export const PREMIUM = "Upper-Market";
export const PREMIUM_LUXURY = "Emerging Premium";
export const LUXURY = "Exclusive Luxury";
export const UPTO_500 = "upto500";
export const ABOVE_500 = "above500";
export const ABOVE_1000 = "above1k";
export const ABOVE_2000 = "above2k";
export const ABOVE_4000 = "above4k";
export const UPTO_50 = "upto50";
export const ABOVE_50 = "above50";
export const ABOVE_100 = "above100";
export const ABOVE_200 = "above200";
export const ABOVE_400 = "above400";
export const BRANDED_OPTION = "brandedOption";
export const DELIVERY_OPTION = "deliveryOption";
export const LUXURY_OPTION = "luxuryOption";
export const CFT_OPTION = "cftOption";
export const SCATTER_LAYER = "ScatterLayer";
export const POLYGON_LAYER = "polygonLayer";
export const ICON_LAYER = "IconLayer";
export const INITIAL_CATEGORY = "clothing_store";

export function convertToRGB(hex: any) {
  let color = [];
  const trimmedHex = hex.trim();
  color[0] = parseInt(trimmedHex.substring(0, 2), 16);
  color[1] = parseInt(trimmedHex.substring(2, 4), 16);
  color[2] = parseInt(trimmedHex.substring(4, 6), 16);
  return color;
}

export const mapLayerDetail = {
  competitorIcon: {
    name: "competitorIcon",
    layerType: ICON_LAYER,
    iconType: "brandIcon",
    color: "#ffb6c1",
  },
  competitorScatter: {
    name: "competitorScatter",
    layerType: SCATTER_LAYER,
    iconType: "brandIcon",
    color: "#ffb6c1",
  },
  complementaryIcon: {
    name: "complementaryIcon",
    layerType: ICON_LAYER,
    iconType: "brandIcon",
    color: "#90EE90",
  },
  complementaryScatter: {
    name: "complementaryScatter",
    layerType: SCATTER_LAYER,
    iconType: "brandIcon",
    color: "#90EE90",
  },
  allPOIsIcon: {
    name: "allPOIsIcon",
    layerType: ICON_LAYER,
    iconType: "brandIcon",
    color: "#87CEEB",
  },
  allPOIsScatter: {
    name: "allPOIsScatter",
    layerType: SCATTER_LAYER,
    iconType: "brandIcon",
    color: "#87CEEB",
  },
  myStore: {
    name: "myStore",
    layerType: SCATTER_LAYER,
    iconType: null,
    color: "#90EE90",
  },
  location: {
    name: "location",
    layerType: ICON_LAYER,
    iconType: "locationIcon",
  },
  isochrone: {
    name: "isochrone",
    layerType: POLYGON_LAYER,
    iconType: null,
  },
  scatter: {
    name: "scatter",
    layerType: SCATTER_LAYER,
    iconType: null,
  },
};

export const allLayers = (layerDetail) => {
  let {
    name = "location",
    iconType = "locationIcon",
    color,
    data = [],
    layerType = POLYGON_LAYER,
  } = layerDetail;

  // if (name === "competitorIcon") {
  //   console.log(data);
  // }

  //   if (iconType === "brandIcon" && layerType === ICON_LAYER) {
  //     let layerData = data.map((detail) => {
  //       return {
  //         ...detail,
  //         iconUrl: detail.brand_logo
  //           ? detail.brand_logo
  //           : mapLogoPath(detail?.category),
  //         iconSize: detail.brand_logo ? 50 : 30,
  //       };
  //     });
  //     data = layerData;
  //   }

  if (layerType === SCATTER_LAYER) {
    return new ScatterplotLayer({
      id: name,
      data,
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 6,
      radiusMinPixels: 4,
      radiusMaxPixels: 6,
      lineWidthMinPixels: 1,
      getRadius: (d) => 3,
      //   getFillColor: (d) => convertToRGB(d.color || color),
      //   getLineColor: (d) => convertToRGB(d.color || color),
      getPosition: (d) => [parseFloat(d?.lng), parseFloat(d?.lat), 1],
      getSize: (d) => 10,
      getColor: (d) => [140, 140, 0],
    });
  }
  if (layerType === POLYGON_LAYER) {
    return new PolygonLayer({
      id: name,
      data,
      pickable: true,
      stroked: true,
      filled: false,
      wireframe: true,
      lineWidthMinPixels: 5,
      getPolygon: (d) => d.geometry,
      getElevation: (d) => 0,
      getLineColor: [80, 80, 80],
      getLineWidth: 5,
    });
  }
  if (layerType === ICON_LAYER) {
    return new IconLayer({
      id: name,
      data,
      pickable: true,
      getIcon: (d) => {
        return {
          url: d?.iconUrl,
          height: 50,
          width: 50,
        };
      },
      sizeScale: 1,
      getPosition: (d) => [parseFloat(d?.lng), parseFloat(d?.lat), 1],
      getSize: (d) => (iconType === "locationIcon" ? 50 : d?.iconSize),
      getColor: (d) => [0, 0, 255],
    });
  }
};
