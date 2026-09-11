// ============================================================
// NTIS — Industrial Facility Operational & Heat Intelligence
// Comprehensive intelligence on what facilities do, industrial
// processes, and thermal/heat emissions profiles.
// ============================================================

export interface FacilityIntelligence {
  name: string
  sector: string
  parentEntity: string
  capacity: string
  location: string
  whatItDoes: string
  operations: string[]
  products: string[]
  heatProduced: {
    baselineFRP: string
    typicalTemperature: string
    heatSources: string[]
    heatDescription: string
    coolingMechanism: string
    environmentalImpact: string
  }
  safetyBufferMeters: number
  riskClassification: string
}

export const FACILITY_INTELLIGENCE_REGISTRY: Record<string, FacilityIntelligence> = {
  'OSM-FAC-BPCL-MUMBAI': {
    name: 'Bharat Petroleum Mumbai Refinery (BPCL)',
    sector: 'Petroleum & Petrochemical Refining',
    parentEntity: 'Bharat Petroleum Corporation Limited (Govt. of India Enterprise)',
    capacity: '12.0 Million Metric Tonnes Per Annum (MMTPA)',
    location: 'Mahul Road, Chembur, Mumbai, Maharashtra 400074',
    whatItDoes:
      'Crude oil processing and petrochemical refining complex. Performs fractional atmospheric and vacuum distillation of imported crude petroleum to produce transportation fuels, aviation fuels, industrial solvents, and petrochemical feedstock.',
    operations: [
      'Atmospheric & Vacuum Crude Distillation Units (CDU / VDU)',
      'Fluidized Catalytic Cracking Unit (FCCU) operating at high temperature',
      'Hydrodesulfurization (HDS) producing BS-VI ultra-low sulfur fuels',
      'Continuous Catalyst Regeneration (CCR) Naphtha Reformer',
      'High-Pressure Process Gas Combustion & Emergency Flare Stacks',
    ],
    products: [
      'Ultra-Low Sulfur High-Speed Diesel (BS-VI)',
      'Motor Spirit / Premium Petrol',
      'Aviation Turbine Fuel (ATF / Jet Fuel)',
      'Liquefied Petroleum Gas (LPG Cylinders)',
      'Bitumen & Industrial Lubricating Base Oils',
      'Petrochemical Propylene & Aromatics',
    ],
    heatProduced: {
      baselineFRP: '45.0 – 78.0 MW (Peak flaring up to 95.0 MW)',
      typicalTemperature: '650°C – 780°C at primary flare stack tip; 450°C–520°C in furnace heaters',
      heatSources: [
        'Continuous thermal flaring of unrecovered light hydrocarbon process gases',
        'Direct-fired crude furnace heaters consuming refinery fuel gas',
        'Catalyst regenerator flue gases during high-temperature coke burn-off',
        'High-pressure utility steam co-generation boilers',
      ],
      heatDescription:
        'Continuous high-intensity thermal radiation emitted from multi-pass flare towers and furnace stacks. Radiates elevated mid-infrared (MIR) signatures detected by NASA VIIRS 3.74µm channels as persistent industrial thermal anomalies.',
      coolingMechanism: 'Closed-loop seawater cooling towers and recirculated industrial cooling water',
      environmentalImpact: 'Controlled volatile organic compound (VOC) combustion; regulated sulfur dioxide and thermal plume dissipation.',
    },
    safetyBufferMeters: 500,
    riskClassification: 'CRITICAL INDUSTRIAL BUFFER (Explosive Vapor & Flare Hazard Zone)',
  },

  'OSM-FAC-HPCL-MAHUL': {
    name: 'Hindustan Petroleum Mahul Refinery (HPCL)',
    sector: 'Petroleum Refining & Lubricant Manufacturing',
    parentEntity: 'Hindustan Petroleum Corporation Limited (Maharatna PSU)',
    capacity: '9.5 Million Metric Tonnes Per Annum (MMTPA)',
    location: 'B.D. Patil Marg, Mahul, Chembur, Mumbai, Maharashtra 400074',
    whatItDoes:
      'Major coastal crude oil refinery specializing in heavy residue upgrading, lube base oil manufacturing, and light distillate refining. Supplies automotive fuels, industrial bitumen, and lube stocks to Western India.',
    operations: [
      'Heavy Fuel Hydrocracking and Visbreaking for residue conversion',
      'Solvent Deasphalting and Lube Base Stock Extraction Units',
      'Continuous Hydrogen Generation & Sulfur Recovery Units (SRU)',
      'Gas Turbine Co-generation combined heat and power plant',
      'Primary & Ground Flare Stack Thermal Emission Systems',
    ],
    products: [
      'Automotive Diesel Fuel & Aviation Fuel',
      'High-grade Mineral Lubricant Base Oils',
      'Industrial Bitumen for infrastructure and road paving',
      'Propylene, Benzene, and Hexane solvent feedstocks',
      'Elemental Molten Sulfur from Claus recovery units',
    ],
    heatProduced: {
      baselineFRP: '40.0 – 68.0 MW (Elevated during maintenance cycles)',
      typicalTemperature: '580°C – 720°C at flare stack; 480°C process reboilers',
      heatSources: [
        'Routine and emergency process gas flaring at the central Mahul flare stack',
        'Crude charge heater burners and vacuum furnace exhausts',
        'Sulfur recovery Claus reaction furnaces operating at 1,000°C internally',
      ],
      heatDescription:
        'Generates consistent multi-day radiometric heat signatures. Thermal radiation peaks during nighttime low-ambient conditions, visible across multiple satellite passes as persistent flare emitter PS-002.',
      coolingMechanism: 'Treated industrial effluent cooling loops and air-cooled heat exchangers',
      environmentalImpact: 'Thermal plume generation with continuous ambient air quality and VOC monitoring.',
    },
    safetyBufferMeters: 500,
    riskClassification: 'CRITICAL INDUSTRIAL BUFFER (High Hydrocarbon Concentration Zone)',
  },

  'OSM-FAC-TATA-TROMBAY': {
    name: 'Tata Power Trombay Thermal Generating Station',
    sector: 'Thermal Power Generation & Utility Infrastructure',
    parentEntity: 'The Tata Power Company Limited',
    capacity: '1,580 MW Base-Load Power Generation Capacity',
    location: 'Trombay, Chembur, Mumbai, Maharashtra 400074',
    whatItDoes:
      'Critical thermal and combined-cycle power generating station supplying uninterrupted electricity to Mumbai’s commercial grid, railways, hospitals, and municipal infrastructure. Operates supercritical steam and gas turbine units.',
    operations: [
      '500 MW Supercritical Pulverized Coal Generation Unit',
      '250 MW Natural Gas Combined Cycle Gas Turbine (CCGT)',
      'High-Pressure Water-Tube Boiler Steam Generation',
      'Flue Gas Desulfurization (FGD) and electrostatic precipitators',
      'Thane Creek condenser cooling water discharge circulation',
    ],
    products: [
      'High-Voltage Electrical Grid Power (220kV / 110kV)',
      'Process Steam for adjacent industrial facilities',
      'Fly Ash for green cement and construction manufacturing',
    ],
    heatProduced: {
      baselineFRP: '35.0 – 85.0 MW (Correlates with electricity generation demand)',
      typicalTemperature: '140°C – 180°C stack gas discharge; 540°C boiler steam generation',
      heatSources: [
        'Supercritical steam boiler furnace exhausts and flue gas stacks',
        'Gas turbine exhaust entering Heat Recovery Steam Generators (HRSG)',
        'Thermal cooling water discharge outfall into coastal channel',
      ],
      heatDescription:
        'Substantial thermal footprint from thermal boilers and turbine exhausts. Radiates broad elevated surface temperatures detectable on satellite thermal infrared bands during high electrical grid dispatch.',
      coolingMechanism: 'Once-through marine cooling water intake and discharge with thermal dispersion channels',
      environmentalImpact: 'Thermal effluent into marine creek; stack emissions controlled via wet limestone FGD.',
    },
    safetyBufferMeters: 800,
    riskClassification: 'HIGH INFRASTRUCTURE SECURITY BUFFER (Critical Power Grid Node)',
  },

  'OSM-FAC-RCF-CHEMBUR': {
    name: 'Rashtriya Chemicals and Fertilizers (RCF Trombay)',
    sector: 'Chemicals & Nitrogenous Fertilizers',
    parentEntity: 'Rashtriya Chemicals and Fertilizers Limited (Govt. of India PSU)',
    capacity: '3.5 Million Metric Tonnes of Fertilizers & Industrial Chemicals',
    location: 'Priyadarshini, Eastern Express Hwy, Chembur/Sion, Mumbai 400022',
    whatItDoes:
      'Major chemical manufacturing facility producing nitrogenous fertilizers, ammonia, urea, and industrial chemical intermediates essential for Indian agriculture and domestic pharmaceutical manufacturing.',
    operations: [
      'Ammonia Synthesis via steam methane reforming at 150-200 bar pressure',
      'Urea granulation and complex NPK (Suphala) fertilizer synthesis',
      'High-concentration Nitric Acid and Ammonium Nitrate plants',
      'Industrial Methanol and Methylamines production lines',
      'Tail gas incineration and catalytic pollution reduction units',
    ],
    products: [
      'Urea (Neem Coated Agricultural Fertilizer)',
      'Suphala NPK Complex Fertilizers (15:15:15)',
      'Anhydrous Industrial Liquid Ammonia',
      'Concentrated Nitric Acid (CNA) & Dilute Nitric Acid',
      'Methanol, Formic Acid, and Sodium Nitrate',
    ],
    heatProduced: {
      baselineFRP: '25.0 – 52.0 MW',
      typicalTemperature: '450°C – 550°C catalytic reformer furnaces; 800°C primary reformer tubes',
      heatSources: [
        'Primary methane steam reforming furnaces converting natural gas to syngas',
        'Waste gas incinerators burning residual chemical process off-gases',
        'Exothermic ammonia synthesis reactor loops releasing reaction heat',
      ],
      heatDescription:
        'Continuous industrial process heat originating from chemical reforming furnaces. Thermal emissions are concentrated around the primary synthesis loops and steam reformer blocks.',
      coolingMechanism: 'Evaporative wet cooling towers and chilled water cooling loops',
      environmentalImpact: 'Exothermic chemical containment; automated ammonia sensor network across perimeter.',
    },
    safetyBufferMeters: 600,
    riskClassification: 'CRITICAL CHEMICAL BUFFER (Toxic Gas & High-Pressure Exothermic Zone)',
  },

  'OSM-FAC-MIDC-TURBHE': {
    name: 'MIDC Turbhe Industrial Manufacturing Estate',
    sector: 'Manufacturing, Metal Smelting & Bulk Chemicals',
    parentEntity: 'Maharashtra Industrial Development Corporation (MIDC)',
    capacity: 'Over 800 Registered Manufacturing & Chemical MSME Units',
    location: 'Turbhe MIDC, Navi Mumbai, Maharashtra 400705',
    whatItDoes:
      'Sprawling industrial zone hosting chemical synthesis plants, foundry metal casting, dye intermediates, industrial lubricants, and bulk commercial warehousing along the Thane-Belapur corridor.',
    operations: [
      'Batch chemical processing and solvent condensation reactions',
      'Non-ferrous metal melting, aluminum die casting, and induction furnaces',
      'Industrial steam generation via multi-fuel commercial boilers',
      'Textile dyeing, bleaching, and thermal drying lines',
    ],
    products: [
      'Specialty Chemical Intermediates & Pigments',
      'Cast Metal Components and Automotive Engineering Parts',
      'Industrial Solvents, Adhesives, and Resins',
      'Fabricated Steel and Precision Hardware',
    ],
    heatProduced: {
      baselineFRP: '18.0 – 48.0 MW',
      typicalTemperature: '350°C – 650°C foundry kilns and boiler exhausts',
      heatSources: [
        'Metal smelting induction furnaces and scrap recycling kilns',
        'Small-to-medium industrial steam boilers and thermic fluid heaters',
        'Paint baking ovens and high-temperature polymer curing units',
      ],
      heatDescription:
        'Localized, intermittent thermal hotspots caused by concurrent batch manufacturing, foundry operations, and steam boiler discharges across industrial clusters.',
      coolingMechanism: 'Individual enterprise cooling towers and localized air radiators',
      environmentalImpact: 'Aggregated urban industrial heat island effect; localized particulate and heat dissipation.',
    },
    safetyBufferMeters: 400,
    riskClassification: 'MODERATE INDUSTRIAL BUFFER (Dense Manufacturing Cluster)',
  },

  'OSM-FAC-MIDC-KOPAR': {
    name: 'TTC Industrial Area Kopar Khairane',
    sector: 'Specialty Chemicals & Bulk Active Pharmaceuticals (APIs)',
    parentEntity: 'Trans-Thane Creek (TTC) Industrial Association & MIDC',
    capacity: 'Over 600 Specialized Chemical and Pharmaceutical Manufacturing Plants',
    location: 'Thane-Belapur Rd, Kopar Khairane, Navi Mumbai 400709',
    whatItDoes:
      'Premier chemical corridor specializing in bulk drug active pharmaceutical ingredients (APIs), specialty polymers, agrochemical pesticides, and organic chemical syntheses requiring regulated thermal reaction vessels.',
    operations: [
      'Exothermic chemical reactors and batch polymerization kettles',
      'Solvent distillation, fractional recovery, and condensation towers',
      'Fluidized bed dryers, spray dryers, and crystallization tanks',
      'Regenerative Thermal Oxidizers (RTO) for VOC destruction',
    ],
    products: [
      'Pharmaceutical Active Ingredients (Antibiotics, Analgesics)',
      'Crop Protection Chemicals and Agrochemical Formulations',
      'Polyurethane, Epoxy, and Specialty Coating Resins',
      'Water Treatment Specialty Polymers',
    ],
    heatProduced: {
      baselineFRP: '15.0 – 38.0 MW',
      typicalTemperature: '250°C – 480°C thermic fluid heaters; 750°C VOC thermal oxidizers',
      heatSources: [
        'Regenerative thermal oxidizers combusting volatile chemical off-gases',
        'Thermic fluid heating systems providing reaction jacket temperatures',
        'Industrial spray drying towers evaporating chemical slurries',
      ],
      heatDescription:
        'Clusters of low-to-medium radiative heat plumes. Periodic thermal peaks occur during thermal oxidizer operation and batch solvent recovery cycles.',
      coolingMechanism: 'Closed chilled brine systems and commercial cooling towers',
      environmentalImpact: 'Volatile organic compound thermal destruction; strict industrial effluent zero-discharge compliance.',
    },
    safetyBufferMeters: 400,
    riskClassification: 'HIGH CHEMICAL BUFFER (Flammable Solvent & Reactive Chemical Zone)',
  },

  'OSM-FAC-JAWAHAR-ISLAND': {
    name: 'Jawahar Dweep Marine Crude Terminal (Butcher Island)',
    sector: 'Offshore Petroleum Logistics & Marine Crude Offloading',
    parentEntity: 'Mumbai Port Authority (MbPA) & Bharat Petroleum',
    capacity: 'Handles over 25 Million Metric Tonnes of Marine Crude Imports Annually',
    location: 'Jawahar Dweep (Butcher Island), Mumbai Harbour, Maharashtra',
    whatItDoes:
      'Deep-water marine crude oil offloading terminal located on Butcher Island in Mumbai Harbour. Receives Very Large Crude Carriers (VLCCs), offloads crude petroleum into massive storage tanks, and pumps it via submarine pipelines to Mahul refineries.',
    operations: [
      'VLCC Supertanker deep-water mooring and offloading jetties',
      'Submarine pipeline booster pump houses transporting crude across the harbour',
      'Tanker ballast water treatment and oil-water separation',
      'Marine vapor recovery and emergency hydrocarbon combustion flares',
    ],
    products: [
      'Imported Heavy & Light Crude Petroleum',
      'Export Refined Fuel Bunker Dispatch',
      'Marine Ship Fuel (VLSFO)',
    ],
    heatProduced: {
      baselineFRP: '22.0 – 62.0 MW (Peaks during supertanker offloading and vapor relief)',
      typicalTemperature: '550°C – 700°C marine relief flare tip',
      heatSources: [
        'Marine vapor relief combustion flares operating during vessel offloading',
        'High-capacity diesel booster pump house engine exhausts',
        'Auxiliary steam boilers for crude oil viscosity heating',
      ],
      heatDescription:
        'Distinct isolated marine thermal anomaly detected in Mumbai Harbour. Thermal spikes coincide with marine crude offloading operations and vapor pressure relief flaring.',
      coolingMechanism: 'Direct seawater cooling loops and open-air marine heat dissipation',
      environmentalImpact: 'Marine environmental buffer; dedicated oil spill response and offshore air monitoring.',
    },
    safetyBufferMeters: 1000,
    riskClassification: 'CRITICAL MARINE PETROLEUM BUFFER (Offshore Hydrocarbon Hazard Zone)',
  },
}

/**
 * Helper to look up or dynamically construct rich facility intelligence
 */
export function getFacilityIntelligence(
  facilityIdOrName?: string | null,
  detectionLocation?: string | null,
  frp?: number
): FacilityIntelligence {
  if (!facilityIdOrName && !detectionLocation) {
    return generateDynamicFallback(detectionLocation, frp)
  }

  const query = String(facilityIdOrName || '').toLowerCase()

  // Match by key or substring
  for (const [key, info] of Object.entries(FACILITY_INTELLIGENCE_REGISTRY)) {
    if (
      facilityIdOrName === key ||
      query.includes('bharat') ||
      query.includes('bpcl')
    ) {
      if (key === 'OSM-FAC-BPCL-MUMBAI') return info
    }
    if (
      query.includes('hindustan') ||
      query.includes('hpcl') ||
      query.includes('mahul refinery')
    ) {
      if (key === 'OSM-FAC-HPCL-MAHUL') return info
    }
    if (query.includes('tata') || query.includes('trombay thermal')) {
      if (key === 'OSM-FAC-TATA-TROMBAY') return info
    }
    if (query.includes('rcf') || query.includes('rashtriya') || query.includes('fertilizer')) {
      if (key === 'OSM-FAC-RCF-CHEMBUR') return info
    }
    if (query.includes('turbhe')) {
      if (key === 'OSM-FAC-MIDC-TURBHE') return info
    }
    if (query.includes('kopar') || query.includes('ttc')) {
      if (key === 'OSM-FAC-MIDC-KOPAR') return info
    }
    if (query.includes('jawahar') || query.includes('butcher') || query.includes('terminal')) {
      if (key === 'OSM-FAC-JAWAHAR-ISLAND') return info
    }
  }

  return generateDynamicFallback(facilityIdOrName || detectionLocation, frp)
}

function generateDynamicFallback(name?: string | null, frp?: number): FacilityIntelligence {
  const heatMW = frp || 35
  const safeName = name || 'Industrial Manufacturing Facility'

  return {
    name: safeName,
    sector: 'Heavy Industrial Processing & Manufacturing',
    parentEntity: 'Registered Industrial Operator (OSM Indexed)',
    capacity: 'Regional Manufacturing & Continuous Industrial Operations',
    location: 'Mumbai–Thane–Navi Mumbai Industrial Belt',
    whatItDoes:
      'Continuous industrial processing facility conducting high-temperature manufacturing, chemical reactions, material synthesis, and process exhaust management.',
    operations: [
      'High-Temperature Furnace Heating & Thermal Processing',
      'Process Off-Gas Emission Management & Controlled Combustion',
      'Continuous Manufacturing & Materials Transformation',
      'Industrial Boiler & Process Steam Generation',
    ],
    products: [
      'Refined Industrial Intermediate Feedstocks',
      'Manufactured Heavy Materials & Commercial Chemicals',
      'Finished Industrial Goods and Energy Byproducts',
    ],
    heatProduced: {
      baselineFRP: `${(heatMW * 0.8).toFixed(1)} – ${(heatMW * 1.3).toFixed(1)} MW`,
      typicalTemperature: '450°C – 680°C combustion zone temperature',
      heatSources: [
        'Direct-fired thermal processing furnaces and process kilns',
        'Industrial boiler exhaust and waste heat discharge channels',
        'Controlled safety flare stack combustion during routine pressure relief',
      ],
      heatDescription: `Active thermal emission generating ${heatMW.toFixed(1)} MW Fire Radiative Power (FRP). Satellite radiometric sensors indicate a localized high-temperature plume distinct from surrounding background terrain.`,
      coolingMechanism: 'Industrial cooling towers and forced-draft heat exchanger radiators',
      environmentalImpact: 'Standard regulated industrial emissions with automated sensor monitoring.',
    },
    safetyBufferMeters: 500,
    riskClassification: 'MONITORED INDUSTRIAL BUFFER ZONE',
  }
}
