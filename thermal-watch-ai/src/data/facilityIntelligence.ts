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

  'OSM-FAC-RELIANCE-JAMNAGAR': {
    name: 'Reliance Jamnagar Petroleum Refinery Complex',
    sector: 'Petroleum Refining & Petrochemical Megaplex',
    parentEntity: 'Reliance Industries Limited (RIL)',
    capacity: '68.2 Million Metric Tonnes Per Annum (World’s Largest Refinery)',
    location: 'Motikhavdi, Jamnagar, Gujarat 361140',
    whatItDoes:
      'The world’s largest and most complex petroleum refining hub. Processes crude oil grades into transportation fuels, polymers, and petrochemical building blocks with over 1.24 million barrels/day refining capacity.',
    operations: [
      'Atmospheric & Vacuum Distillation Units (AVU)',
      'Fluidized Catalytic Cracking (FCC) and Resid Fluidized Catalytic Cracking (RFCC)',
      'Delayed Coking Units (DCU) and Gasification of Petroleum Coke',
      'Continuous Hydrocracking and Catalytic Reforming',
      'High-Capacity Elevated and Ground Flare Combustion Stacks',
    ],
    products: [
      'Ultra-Low Sulfur BS-VI Diesel & Jet Fuel (ATF)',
      'Euro-VI Compliant Motor Gasoline (Petrol)',
      'Polypropylene, Polyethylene, and Paraxylene',
      'Liquefied Petroleum Gas (LPG) & Naphtha',
    ],
    heatProduced: {
      baselineFRP: '65.0 – 140.0 MW (World-scale thermal signature)',
      typicalTemperature: '700°C – 950°C at elevated flare stacks; 500°C+ cracker furnaces',
      heatSources: [
        'Continuous thermal flaring of unrecovered light ends and off-gases',
        'Petcoke gasifiers and high-pressure steam utility boilers',
        'Direct-fired refinery heaters and catalyst regenerator flue exhausts',
      ],
      heatDescription:
        'One of the largest persistent industrial thermal anomaly signatures in Asia. NASA VIIRS satellites consistently record high Fire Radiative Power (FRP) over Jamnagar flare towers.',
      coolingMechanism: 'Extensive seawater cooling channels and high-volume cooling towers',
      environmentalImpact: 'Continuous flare gas recovery systems; ambient air and VOC perimeter monitoring.',
    },
    safetyBufferMeters: 1500,
    riskClassification: 'CRITICAL PETROLEUM MEGAPLEX BUFFER (Explosive Vapor & Flare Hazard Zone)',
  },

  'OSM-FAC-DAHEJ-PCPIR': {
    name: 'Dahej PCPIR Petrochemical & Flare SEZ',
    sector: 'Chemicals, Petrochemicals & Hydrocarbon Cracking',
    parentEntity: 'ONGC Petro additions Limited (OPaL) & Gujarat Chemical Port',
    capacity: '1.4 Million Metric Tonnes Per Annum Ethylene / Dual Feed Cracker',
    location: 'Dahej Industrial Area, Vagra, Bharuch, Gujarat 392130',
    whatItDoes:
      'Premier Petroleum, Chemicals and Petrochemical Investment Region (PCPIR). Features mega dual-feed steam crackers, polyolefin plants, chlor-alkali production, and LNG regasification terminals.',
    operations: [
      'Dual Feed Steam Cracker Unit (DFCU) cracking ethane, propane, and naphtha',
      'Polyethylene (HDPE/LLDPE) and Polypropylene manufacturing lines',
      'Pyrolysis Gasoline Hydrogenation and Benzene Extraction',
      'Emergency process flare systems and thermal oxidizers',
    ],
    products: [
      'High-Density Polyethylene (HDPE) & Linear Low-Density Polyethylene (LLDPE)',
      'Industrial Polymers, Benzene, and Butadiene',
      'Caustic Soda, Chlorine, and Chlorinated Organics',
    ],
    heatProduced: {
      baselineFRP: '35.0 – 85.0 MW',
      typicalTemperature: '800°C – 850°C steam cracking pyrolysis furnaces; 750°C flare tips',
      heatSources: [
        'High-temperature steam cracking pyrolysis furnaces',
        'Process off-gas emergency and operational flare stacks',
        'High-pressure steam boiler discharges and cracking quench units',
      ],
      heatDescription:
        'Continuous thermal infrared emissions from steam cracking furnaces and flare towers along the Gulf of Khambhat coastline.',
      coolingMechanism: 'Coastal cooling water systems and wet cooling towers',
      environmentalImpact: 'Continuous VOC and sulfur perimeter monitoring with thermal dispersion buffers.',
    },
    safetyBufferMeters: 800,
    riskClassification: 'CRITICAL CHEMICAL SEZ BUFFER (High-Temperature Hydrocarbon Cracking Zone)',
  },

  'OSM-FAC-HAZIRA-SURAT': {
    name: 'Hazira LNG & Heavy Industrial Manufacturing Complex',
    sector: 'Steel Smelting, Petrochemicals & LNG Infrastructure',
    parentEntity: 'ArcelorMittal Nippon Steel (AM/NS) & Reliance Hazira',
    capacity: '9.6 Million Tonnes Steel & Mega Petrochemical Feedstock Units',
    location: 'Hazira Industrial Area, Surat, Gujarat 394510',
    whatItDoes:
      'Integrated industrial coastal hub housing giant steel manufacturing (AM/NS India), Reliance petrochemical cracking plants, LNG import terminals, and heavy engineering facilities.',
    operations: [
      'Corex and Blast Furnace Ironmaking & Direct Reduced Iron (DRI) kilns',
      'Basic Oxygen Furnaces (BOF) and Continuous Slab Casting',
      'Purified Terephthalic Acid (PTA) and Polyester Synthesis',
      'LNG cryogenic regasification and boil-off gas combustion',
    ],
    products: [
      'Hot-Rolled & Cold-Rolled Steel Coils and Structural Plates',
      'Polyester Staple Fiber & Polyester Filament Yarn',
      'Regasified Liquefied Natural Gas (RLNG) for national pipeline grid',
    ],
    heatProduced: {
      baselineFRP: '45.0 – 95.0 MW',
      typicalTemperature: '1,400°C molten steel; 700°C petrochemical cracking heaters',
      heatSources: [
        'Blast furnace molten pig iron tapping and slag flushes',
        'Direct Reduced Iron rotary kilns operating at high thermal output',
        'Petrochemical cracker furnace and flare emissions',
      ],
      heatDescription:
        'Intense combined metallurgical and petrochemical thermal signature. Satellite infrared sensors record high radiance over Hazira industrial waterfront.',
      coolingMechanism: 'Tapi estuary industrial cooling intake and heavy-duty cooling towers',
      environmentalImpact: 'Comprehensive dust collection, slag recycling, and continuous emission monitoring.',
    },
    safetyBufferMeters: 1000,
    riskClassification: 'CRITICAL METALLURGICAL & CHEMICAL BUFFER (High-Heat Smelting & Flare Zone)',
  },

  'OSM-FAC-JINDAL-ANGUL': {
    name: 'JSPL Angul Integrated Steel & Blast Furnace Plant',
    sector: 'Integrated Iron & Steel Metallurgy',
    parentEntity: 'Jindal Steel and Power Limited (JSPL)',
    capacity: '6.0 Million Tonnes Per Annum Steel (Expanding to 12 MTPA)',
    location: 'Chhendipada Rd, Angul, Odisha 759145',
    whatItDoes:
      'Mega integrated steel plant utilizing coal gasification and blast furnace routes to convert raw iron ore into high-grade infrastructure steel, plates, and rails.',
    operations: [
      '4,554 cubic-meter Blast Furnace operating at extreme temperatures',
      'Direct Reduced Iron (DRI) coal gasification steelmaking',
      'Basic Oxygen Furnace (BOF) & Electric Arc Furnaces (EAF)',
      'Plate Mill and Rail Mill hot rolling operations',
      'Captive coal-based thermal power generation',
    ],
    products: [
      'Wide Steel Plates for shipbuilding and defense',
      'Long Rails and Heavy Structural Beams',
      'Hot Metal, Steel Billets, and Wire Rods',
    ],
    heatProduced: {
      baselineFRP: '50.0 – 110.0 MW',
      typicalTemperature: '1,450°C – 1,600°C molten iron and steel tapping; 1,100°C reheat furnaces',
      heatSources: [
        'Blast furnace molten metal tapping and slag runner troughs',
        'Coal gasification synthesis reactors and gas flaring',
        'Slab reheat rolling furnaces and captive boiler exhausts',
      ],
      heatDescription:
        'Massive metallurgical thermal hotspot in central Odisha. Persistent high-energy thermal signature detectable throughout the year on VIIRS night-pass bands.',
      coolingMechanism: 'Samal Barrage industrial cooling water intake and multi-cell cooling towers',
      environmentalImpact: 'Coke dry quenching and waste heat power generation to minimize open thermal loss.',
    },
    safetyBufferMeters: 1000,
    riskClassification: 'CRITICAL METALLURGICAL BUFFER (Extreme Blast Furnace Thermal Zone)',
  },

  'OSM-FAC-SAIL-BHILAI': {
    name: 'SAIL Bhilai Integrated Steel Plant',
    sector: 'Primary Steel Manufacturing & Rail Metallurgy',
    parentEntity: 'Steel Authority of India Limited (Maharatna PSU)',
    capacity: '7.0 Million Tonnes of Crude Steel Per Annum',
    location: 'Bhilai, Durg, Chhattisgarh 490001',
    whatItDoes:
      'India’s primary manufacturer of world-class rails for Indian Railways and heavy steel plates. Operates massive blast furnaces, sinter plants, and hot rolling mills.',
    operations: [
      'Blast Furnace No. 8 (Mahamaya) and coke oven batteries',
      'Basic Oxygen Process shop with secondary refining units',
      'Universal Rail Mill rolling 130-meter long world-record rail sections',
      'Continuous casting machines and captive thermal generation',
    ],
    products: [
      'Prime Rail Steel (R260 / 880 grade) for Indian Railways',
      'Heavy Steel Plates, Wire Rods, and Structural Channels',
    ],
    heatProduced: {
      baselineFRP: '40.0 – 90.0 MW',
      typicalTemperature: '1,500°C liquid iron; 1,200°C rail billet reheating',
      heatSources: [
        'Blast furnace hearth molten metal discharge and slag skimming',
        'Coke oven byproduct gas flaring and charging emissions',
        'Continuous bloom and billet casting thermal radiation',
      ],
      heatDescription:
        'Substantial, persistent industrial thermal anomaly in the Durg-Bhilai basin. Distinct infrared radiation peaks observed during molten steel tapping.',
      coolingMechanism: 'Maroda water reservoirs and recirculated closed-loop cooling towers',
      environmentalImpact: 'Advanced electrostatic precipitators and blast furnace gas recovery systems.',
    },
    safetyBufferMeters: 800,
    riskClassification: 'HIGH METALLURGICAL BUFFER (Primary Steelmaking & Blast Furnace Zone)',
  },

  'OSM-FAC-TATA-JAMSHEDPUR': {
    name: 'Tata Steel Jamshedpur Works',
    sector: 'Integrated Iron, Steel & Automotive Grade Metallurgy',
    parentEntity: 'Tata Steel Limited',
    capacity: '11.0 Million Tonnes Per Annum Crude Steel',
    location: 'Bistupur, Jamshedpur, Jharkhand 831001',
    whatItDoes:
      'Historic flagship integrated steelworks producing automotive steel, tinplate, and engineering bars. Features high-efficiency blast furnaces (I & K Blast Furnaces) and advanced LD shops.',
    operations: [
      'High-productivity blast furnaces with pulverized coal injection',
      'LD Converter Steelmaking and Argon Oxygen Decarburization',
      'Hot Strip Mill and Cold Rolling Complex',
      'Coke oven batteries with stamp charging technology',
    ],
    products: [
      'High-Strength Automotive Steels & Galvanized Coils',
      'Tinplate for food packaging and commercial containers',
      'Precision Bars and Construction Rebars (Tata Tiscon)',
    ],
    heatProduced: {
      baselineFRP: '45.0 – 98.0 MW',
      typicalTemperature: '1,550°C liquid steel; 1,150°C hot strip slab reheating',
      heatSources: [
        'Blast furnace molten iron tapping operations',
        'LD shop molten steel processing and converter gas combustion',
        'Reheat furnaces and continuous casting radiant heat',
      ],
      heatDescription:
        'Major persistent urban-adjacent metallurgical thermal anomaly in the Chota Nagpur plateau. Monitored continuously by satellite infrared payloads.',
      coolingMechanism: 'Dimna Lake / Subarnarekha river cooling water circulation loops',
      environmentalImpact: 'Zero effluent discharge; automated LD gas holders capturing process heat.',
    },
    safetyBufferMeters: 800,
    riskClassification: 'HIGH METALLURGICAL BUFFER (Automotive Steelmaking & Blast Furnace Zone)',
  },

  'OSM-FAC-IOCL-PANIPAT': {
    name: 'IOCL Panipat Refinery & Petrochemical Complex',
    sector: 'Petroleum Refining & Aromatic Petrochemicals',
    parentEntity: 'Indian Oil Corporation Limited (Maharatna PSU)',
    capacity: '15.0 Million Metric Tonnes Per Annum (Expanding to 25 MTPA)',
    location: 'Baholi, Panipat, Haryana 132140',
    whatItDoes:
      'Largest integrated public-sector petroleum refinery and petrochemical hub in Northern India. Delivers transportation fuels, aviation turbine fuel, and polymers to North India.',
    operations: [
      'Atmospheric & Vacuum Distillation and Indmax FCC Technology',
      'Naphtha Cracker Unit (NCU) and Purified Terephthalic Acid (PTA) plant',
      'Hydrocracker and Diesel Hydrotreating units producing BS-VI fuels',
      'Elevated multi-point flare stacks and sulfur recovery units',
    ],
    products: [
      'BS-VI High-Speed Diesel, Premium Petrol, and Aviation Turbine Fuel',
      'Polypropylene, Polyethylene, and Paraxylene',
      'Linear Alkyl Benzene (LAB) for detergent manufacturing',
    ],
    heatProduced: {
      baselineFRP: '40.0 – 82.0 MW',
      typicalTemperature: '650°C – 780°C flare tips; 500°C cracker reboilers',
      heatSources: [
        'Naphtha cracker and refinery emergency flare stacks',
        'Direct-fired crude furnace exhausts and utility steam boilers',
        'Indmax catalytic cracking regenerator flue heat discharge',
      ],
      heatDescription:
        'Dominant industrial thermal hotspot in the Haryana-NCR corridor. Radiometric signatures contrast distinctly against surrounding agricultural plains.',
      coolingMechanism: 'Recirculated canal water cooling towers and air-cooled heat exchangers',
      environmentalImpact: 'State-of-the-art flare gas recovery and continuous VOC emission monitoring.',
    },
    safetyBufferMeters: 750,
    riskClassification: 'CRITICAL REFINERY BUFFER (High Hydrocarbon & Flare Stack Zone)',
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
  const locQuery = String(detectionLocation || '').toLowerCase()
  const fullText = `${query} ${locQuery}`

  // Match by key or substring
  for (const [key, info] of Object.entries(FACILITY_INTELLIGENCE_REGISTRY)) {
    if (facilityIdOrName === key) return info

    if (fullText.includes('jamnagar') || fullText.includes('reliance') || fullText.includes('motikhavdi')) {
      if (key === 'OSM-FAC-RELIANCE-JAMNAGAR') return info
    }
    if (fullText.includes('dahej') || fullText.includes('pcpir') || fullText.includes('vagra')) {
      if (key === 'OSM-FAC-DAHEJ-PCPIR') return info
    }
    if (fullText.includes('hazira') || fullText.includes('surat')) {
      if (key === 'OSM-FAC-HAZIRA-SURAT') return info
    }
    if (fullText.includes('angul') || fullText.includes('jspl') || fullText.includes('jindal steel')) {
      if (key === 'OSM-FAC-JINDAL-ANGUL') return info
    }
    if (fullText.includes('bhilai') || fullText.includes('durg') || fullText.includes('sail bhilai')) {
      if (key === 'OSM-FAC-SAIL-BHILAI') return info
    }
    if (fullText.includes('jamshedpur') || fullText.includes('tata steel') || fullText.includes('bistupur')) {
      if (key === 'OSM-FAC-TATA-JAMSHEDPUR') return info
    }
    if (fullText.includes('panipat') || fullText.includes('iocl panipat') || fullText.includes('baholi')) {
      if (key === 'OSM-FAC-IOCL-PANIPAT') return info
    }
    if (fullText.includes('bharat') || fullText.includes('bpcl') || fullText.includes('mumbai refinery')) {
      if (key === 'OSM-FAC-BPCL-MUMBAI') return info
    }
    if (fullText.includes('hindustan') || fullText.includes('hpcl') || fullText.includes('mahul refinery')) {
      if (key === 'OSM-FAC-HPCL-MAHUL') return info
    }
    if (fullText.includes('tata') || fullText.includes('trombay thermal')) {
      if (key === 'OSM-FAC-TATA-TROMBAY') return info
    }
    if (fullText.includes('rcf') || fullText.includes('rashtriya') || fullText.includes('fertilizer')) {
      if (key === 'OSM-FAC-RCF-CHEMBUR') return info
    }
    if (fullText.includes('turbhe')) {
      if (key === 'OSM-FAC-MIDC-TURBHE') return info
    }
    if (fullText.includes('kopar') || fullText.includes('ttc')) {
      if (key === 'OSM-FAC-MIDC-KOPAR') return info
    }
    if (fullText.includes('jawahar') || fullText.includes('butcher') || fullText.includes('terminal')) {
      if (key === 'OSM-FAC-JAWAHAR-ISLAND') return info
    }
  }

  return generateDynamicFallback(facilityIdOrName || detectionLocation, frp)
}

function generateDynamicFallback(name?: string | null, frp?: number): FacilityIntelligence {
  const heatMW = frp || 35
  const safeName = name || 'Regional Geospatial Anomaly Sector'
  const isAgri = safeName.toLowerCase().includes('punjab') ||
                 safeName.toLowerCase().includes('haryana') ||
                 safeName.toLowerCase().includes('agricultural') ||
                 safeName.toLowerCase().includes('basin')

  if (isAgri) {
    return {
      name: safeName,
      sector: 'Agricultural Biomass & Open Thermal Combustion',
      parentEntity: 'Regional Agricultural & Open Land Corridor',
      capacity: 'Seasonal Harvesting & Farm Stubble Clearance Zone',
      location: 'Northern / Central Agricultural Plains of India',
      whatItDoes:
        'Seasonal agricultural cultivation belt experiencing post-harvest open crop residue clearing (paddy / wheat stubble burning) or localized rural biomass combustion.',
      operations: [
        'Open-field post-harvest stubble clearing and burning',
        'Agricultural land preparation and organic residue combustion',
        'Rural biomass and seasonal vegetative clearance',
      ],
      products: [
        'Harvested Paddy / Wheat Agricultural Produce',
        'Soil preparation for upcoming rabi/kharif sowing cycles',
      ],
      heatProduced: {
        baselineFRP: `${(heatMW * 0.8).toFixed(1)} – ${(heatMW * 1.2).toFixed(1)} MW`,
        typicalTemperature: '350°C – 500°C open vegetative combustion',
        heatSources: [
          'Direct open-air flaming and smoldering agricultural crop stubble',
          'Surface vegetative combustion across harvested crop fields',
        ],
        heatDescription: `Satellite sensor detected open thermal radiance of ${heatMW.toFixed(1)} MW FRP. Radiometric characteristics match active biomass combustion with rapid smoke and aerosol plume dispersion.`,
        coolingMechanism: 'Natural open-atmosphere ambient air and wind dissipation',
        environmentalImpact: 'Elevated seasonal PM2.5, PM10, and carbon monoxide atmospheric plume dispersion.',
      },
      safetyBufferMeters: 300,
      riskClassification: 'SEASONAL AGRICULTURAL EMISSION ZONE',
    }
  }

  return {
    name: safeName,
    sector: 'Heavy Industrial Processing & Manufacturing',
    parentEntity: 'Registered Industrial Operator (OSM Indexed)',
    capacity: 'Regional Manufacturing & Continuous Industrial Operations',
    location: 'Indian Industrial & Manufacturing Corridor',
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
