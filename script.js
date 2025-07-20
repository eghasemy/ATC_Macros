// Global configuration object
const config = {
    firmware: 'fluidnc',
    magazineCount: 2,
    units: 21,
    engageZ: -141.5,
    loadSpinZ: -125,
    plungeCount: 2,
    toLoadZ: -80,
    toMeasureZ: -80,
    safeZ: -80,
    engageFeed: 2000,
    unloadRpm: 2000,
    loadRpm: 1600,
    measureEnabled: true,
    measureX: 1184.7,
    measureY: 74.7,
    measureStartZ: -80,
    seekDistance: 150,
    retractDistance: 1,
    seekFeed: 500,
    setFeed: 25,
    tloRef: 0,
    manualX: 100,
    manualY: 50,
    coverMode: 0,
    coverAxis: 3,
    coverClosedPos: 0,
    coverOpenPos: 0,
    coverOutput: 0,
    coverDwell: 1,
    recognizeEnabled: false,
    recInput: 0,
    zoneOneZ: -63.5,
    zoneTwoZ: -57.0,
    magazines: []
};

// Default magazine configuration
const defaultMagazineConfig = {
    pockets: 4,
    pocketOffset: 35,
    alignment: 0, // 0 = X axis, 1 = Y axis
    direction: 1, // 1 = positive, -1 = negative
    pocketOneX: 0,
    pocketOneY: 0
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateMagazineConfiguration();
    loadConfiguration();
    
    // Initialize dynamic sections
    toggleMeasurementSettings();
    toggleRecognitionSettings();
    toggleDustCoverSettings();
});

function initializeEventListeners() {
    // Firmware selection
    document.querySelectorAll('input[name="firmware"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            config.firmware = e.target.value;
            updateFirmwareSpecificSettings();
        });
    });

    // Magazine count change
    document.getElementById('magazine-count').addEventListener('change', (e) => {
        config.magazineCount = parseInt(e.target.value);
        updateMagazineConfiguration();
    });

    // Tool measurement toggle
    document.getElementById('measure-enabled').addEventListener('change', (e) => {
        config.measureEnabled = e.target.checked;
        toggleMeasurementSettings();
    });

    // Tool recognition toggle
    document.getElementById('recognize-enabled').addEventListener('change', (e) => {
        config.recognizeEnabled = e.target.checked;
        toggleRecognitionSettings();
    });

    // Dust cover mode change
    document.getElementById('cover-mode').addEventListener('change', (e) => {
        config.coverMode = parseInt(e.target.value);
        toggleDustCoverSettings();
    });

    // Generate button
    document.getElementById('generate-btn').addEventListener('click', generateMacros);

    // Preview button
    document.getElementById('preview-btn').addEventListener('click', previewConfiguration);

    // Tooltip handling
    setupTooltips();

    // Global settings listeners
    setupGlobalSettingsListeners();
}

function setupGlobalSettingsListeners() {
    const inputs = [
        'units', 'engage-z', 'load-spin-z', 'plunge-count', 'to-load-z', 'to-measure-z', 
        'safe-z', 'engage-feed', 'unload-rpm', 'load-rpm', 'measure-x', 'measure-y', 
        'measure-start-z', 'seek-distance', 'retract-distance', 'seek-feed', 'set-feed', 
        'tlo-ref', 'manual-x', 'manual-y', 'cover-mode', 'cover-axis', 'cover-closed-pos', 
        'cover-open-pos', 'cover-output', 'cover-dwell', 'rec-input', 'zone-one-z', 'zone-two-z'
    ];

    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', (e) => {
                const key = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                config[key] = element.type === 'number' ? parseFloat(e.target.value) : 
                             element.type === 'select-one' ? parseInt(e.target.value) : e.target.value;
                
                // Handle special cases for dynamic settings
                if (id === 'cover-mode') {
                    toggleDustCoverSettings();
                }
            });
        }
    });
}

function updateFirmwareSpecificSettings() {
    // Update default values based on firmware
    if (config.firmware === 'grblhal') {
        // GrblHAL now supports up to 9 magazines
        document.getElementById('magazine-count').innerHTML = `
            <option value="1">1 Magazine</option>
            <option value="2" selected>2 Magazines</option>
            <option value="3">3 Magazines</option>
            <option value="4">4 Magazines</option>
            <option value="5">5 Magazines</option>
            <option value="6">6 Magazines</option>
            <option value="7">7 Magazines</option>
            <option value="8">8 Magazines</option>
            <option value="9">9 Magazines</option>
        `;
    } else {
        // FluidNC supports up to 9 magazines
        document.getElementById('magazine-count').innerHTML = `
            <option value="1">1 Magazine</option>
            <option value="2">2 Magazines</option>
            <option value="3">3 Magazines</option>
            <option value="4">4 Magazines</option>
            <option value="5">5 Magazines</option>
            <option value="6">6 Magazines</option>
            <option value="7">7 Magazines</option>
            <option value="8">8 Magazines</option>
            <option value="9">9 Magazines</option>
        `;
    }
    updateMagazineConfiguration();
}

function updateMagazineConfiguration() {
    const container = document.getElementById('magazines-container');
    container.innerHTML = '';

    // Initialize magazines array
    config.magazines = [];

    for (let i = 0; i < config.magazineCount; i++) {
        config.magazines.push({...defaultMagazineConfig});
        createMagazineSection(i + 1, container);
    }
}

function createMagazineSection(magazineNum, container) {
    const section = document.createElement('div');
    section.className = 'magazine-section fade-in';
    
    const magazineConfig = config.magazines[magazineNum - 1];
    
    section.innerHTML = `
        <h3>Magazine ${magazineNum} Configuration</h3>
        <div class="settings-grid">
            <div class="input-group">
                <label for="mag${magazineNum}-pockets">Number of Pockets:</label>
                <input type="number" id="mag${magazineNum}-pockets" name="mag${magazineNum}-pockets" 
                       value="${magazineConfig.pockets}" min="1" max="20">
                <span class="tooltip" data-tooltip="Number of tool pockets in this magazine">?</span>
            </div>
            
            <div class="input-group">
                <label for="mag${magazineNum}-offset">Pocket Offset:</label>
                <input type="number" id="mag${magazineNum}-offset" name="mag${magazineNum}-offset" 
                       value="${magazineConfig.pocketOffset}" step="0.1">
                <span class="tooltip" data-tooltip="Distance between consecutive pockets">?</span>
            </div>
            
            <div class="input-group">
                <label for="mag${magazineNum}-alignment">Alignment:</label>
                <select id="mag${magazineNum}-alignment" name="mag${magazineNum}-alignment">
                    <option value="0" ${magazineConfig.alignment === 0 ? 'selected' : ''}>X Axis</option>
                    <option value="1" ${magazineConfig.alignment === 1 ? 'selected' : ''}>Y Axis</option>
                </select>
                <span class="tooltip" data-tooltip="Axis along which the magazine is aligned">?</span>
            </div>
            
            <div class="input-group">
                <label for="mag${magazineNum}-direction">Direction:</label>
                <select id="mag${magazineNum}-direction" name="mag${magazineNum}-direction">
                    <option value="1" ${magazineConfig.direction === 1 ? 'selected' : ''}>Positive</option>
                    <option value="-1" ${magazineConfig.direction === -1 ? 'selected' : ''}>Negative</option>
                </select>
                <span class="tooltip" data-tooltip="Direction from pocket 1 to pocket 2">?</span>
            </div>
            
            <div class="input-group">
                <label for="mag${magazineNum}-x">Pocket 1 X Position:</label>
                <input type="number" id="mag${magazineNum}-x" name="mag${magazineNum}-x" 
                       value="${magazineConfig.pocketOneX}" step="0.1">
                <span class="tooltip" data-tooltip="X machine coordinate of pocket 1">?</span>
            </div>
            
            <div class="input-group">
                <label for="mag${magazineNum}-y">Pocket 1 Y Position:</label>
                <input type="number" id="mag${magazineNum}-y" name="mag${magazineNum}-y" 
                       value="${magazineConfig.pocketOneY}" step="0.1">
                <span class="tooltip" data-tooltip="Y machine coordinate of pocket 1">?</span>
            </div>
        </div>
    `;
    
    container.appendChild(section);
    
    // Add event listeners for this magazine
    setupMagazineListeners(magazineNum);
}

function setupMagazineListeners(magazineNum) {
    const inputs = ['pockets', 'offset', 'alignment', 'direction', 'x', 'y'];
    
    inputs.forEach(input => {
        const element = document.getElementById(`mag${magazineNum}-${input}`);
        if (element) {
            element.addEventListener('change', (e) => {
                const magazine = config.magazines[magazineNum - 1];
                switch(input) {
                    case 'pockets':
                        magazine.pockets = parseInt(e.target.value);
                        break;
                    case 'offset':
                        magazine.pocketOffset = parseFloat(e.target.value);
                        break;
                    case 'alignment':
                        magazine.alignment = parseInt(e.target.value);
                        break;
                    case 'direction':
                        magazine.direction = parseInt(e.target.value);
                        break;
                    case 'x':
                        magazine.pocketOneX = parseFloat(e.target.value);
                        break;
                    case 'y':
                        magazine.pocketOneY = parseFloat(e.target.value);
                        break;
                }
            });
        }
    });
}

function toggleMeasurementSettings() {
    const settings = document.getElementById('measurement-settings');
    settings.style.display = config.measureEnabled ? 'block' : 'none';
}

function toggleRecognitionSettings() {
    const settings = document.getElementById('recognition-settings');
    settings.style.display = config.recognizeEnabled ? 'block' : 'none';
}

function toggleDustCoverSettings() {
    const axisSettings = document.getElementById('axis-settings');
    const outputSettings = document.getElementById('output-settings');
    
    axisSettings.style.display = config.coverMode === 1 ? 'block' : 'none';
    outputSettings.style.display = config.coverMode === 2 ? 'block' : 'none';
}

function loadConfiguration() {
    // Load current values from form
    config.firmware = document.querySelector('input[name="firmware"]:checked').value;
    config.units = parseInt(document.getElementById('units').value);
    config.engageZ = parseFloat(document.getElementById('engage-z').value);
    config.loadSpinZ = parseFloat(document.getElementById('load-spin-z').value);
    config.plungeCount = parseInt(document.getElementById('plunge-count').value);
    config.toLoadZ = parseFloat(document.getElementById('to-load-z').value);
    config.toMeasureZ = parseFloat(document.getElementById('to-measure-z').value);
    config.safeZ = parseFloat(document.getElementById('safe-z').value);
    config.engageFeed = parseFloat(document.getElementById('engage-feed').value);
    config.unloadRpm = parseFloat(document.getElementById('unload-rpm').value);
    config.loadRpm = parseFloat(document.getElementById('load-rpm').value);
    config.measureEnabled = document.getElementById('measure-enabled').checked;
    
    if (config.measureEnabled) {
        config.measureX = parseFloat(document.getElementById('measure-x').value);
        config.measureY = parseFloat(document.getElementById('measure-y').value);
        config.measureStartZ = parseFloat(document.getElementById('measure-start-z').value);
        config.seekDistance = parseFloat(document.getElementById('seek-distance').value);
        config.retractDistance = parseFloat(document.getElementById('retract-distance').value);
        config.seekFeed = parseFloat(document.getElementById('seek-feed').value);
        config.setFeed = parseFloat(document.getElementById('set-feed').value);
        config.tloRef = parseFloat(document.getElementById('tlo-ref').value);
    }
    
    config.manualX = parseFloat(document.getElementById('manual-x').value);
    config.manualY = parseFloat(document.getElementById('manual-y').value);
    
    // Dust cover settings
    config.coverMode = parseInt(document.getElementById('cover-mode').value);
    config.coverAxis = parseInt(document.getElementById('cover-axis').value);
    config.coverClosedPos = parseFloat(document.getElementById('cover-closed-pos').value);
    config.coverOpenPos = parseFloat(document.getElementById('cover-open-pos').value);
    config.coverOutput = parseInt(document.getElementById('cover-output').value);
    config.coverDwell = parseFloat(document.getElementById('cover-dwell').value);
    
    // Tool recognition settings
    config.recognizeEnabled = document.getElementById('recognize-enabled').checked;
    if (config.recognizeEnabled) {
        config.recInput = parseInt(document.getElementById('rec-input').value);
        config.zoneOneZ = parseFloat(document.getElementById('zone-one-z').value);
        config.zoneTwoZ = parseFloat(document.getElementById('zone-two-z').value);
    }
    
    toggleMeasurementSettings();
    toggleRecognitionSettings();
    toggleDustCoverSettings();
}

function generateMacros() {
    loadConfiguration();
    
    let macroFiles = [];
    
    if (config.firmware === 'fluidnc') {
        macroFiles = generateFluidNCMacros();
    } else {
        macroFiles = generateGrblHALMacros();
    }
    
    displayMacros(macroFiles);
    
    // Show output section
    document.getElementById('output-section').style.display = 'block';
    document.getElementById('output-section').scrollIntoView({ behavior: 'smooth' });
}

function generateFluidNCMacros() {
    return [
        {
            filename: 'init.nc',
            content: generateFluidNCInit()
        },
        {
            filename: 'tc.nc',
            content: generateFluidNCToolChange()
        }
    ];
}

function generateGrblHALMacros() {
    return [
        {
            filename: 'P200.macro',
            content: generateGrblHALInit()
        },
        {
            filename: 'TC.macro',
            content: generateGrblHALToolChange()
        },
        {
            filename: 'P208.macro',
            content: generateGrblHALDustCoverOpen()
        },
        {
            filename: 'P209.macro',
            content: generateGrblHALDustCoverClose()
        },
        {
            filename: 'P231.macro',
            content: generateGrblHALToolMeasure()
        }
    ];
}

function generateFluidNCInit() {
    let content = `; ******** BEGIN USER CONFIGURATION ********
; ATC Operations
; The units for your configuration: 20 = Inches, 21 = Millimeters
#<_rc_units> = ${config.units}
(print,Units: #<_rc_units>)

`;

    // Magazine configurations
    for (let i = 0; i < config.magazineCount; i++) {
        const mag = config.magazines[i];
        const magNum = i + 1;
        
        content += `; The number of pockets in your ${getOrdinal(magNum)} magazine.
#<_rc${magNum}_pockets> = ${mag.pockets}
(print,Pockets: #<_rc${magNum}_pockets>)

`;
    }

    content += `; The pocket offset for your magazines.
#<_rc_pocket_offset> = ${config.magazines[0].pocketOffset}
(print,Pocket Offset: #<_rc_pocket_offset>)

`;

    // Magazine alignments
    for (let i = 0; i < config.magazineCount; i++) {
        const mag = config.magazines[i];
        const magNum = i + 1;
        
        content += `; The axis along which the ${getOrdinal(magNum)} magazine is aligned: 0 = X Axis, 1 = Y Axis.
#<_rc${magNum}_alignment> = ${mag.alignment}
(print,Alignment: #<_rc${magNum}_alignment>)

`;
    }

    // Magazine directions
    for (let i = 0; i < config.magazineCount; i++) {
        const mag = config.magazines[i];
        const magNum = i + 1;
        
        content += `; The direction of travel from pocket 1 to pocket 2 for the ${getOrdinal(magNum)} magazine: 1 = Positive, -1 = Negative.
#<_rc${magNum}_direction> = ${mag.direction}
(print,Direction: #<_rc${magNum}_direction>)

`;
    }

    // Magazine positions
    for (let i = 0; i < config.magazineCount; i++) {
        const mag = config.magazines[i];
        const magNum = i + 1;
        
        content += `; The X an Y machine coordinate positions of pocket 1 of the ${getOrdinal(magNum)} magazine.
#<_rc${magNum}_pckt_one_x> = ${mag.pocketOneX}
(print,Pocket 1 X: #<_rc${magNum}_pckt_one_x>)

#<_rc${magNum}_pckt_one_y> = ${mag.pocketOneY}
(print,Pocket 1 Y: #<_rc${magNum}_pckt_one_y>)

`;
    }

    // Z positions and other settings
    content += `; The Z machine coordinate positon of engagement.
#<_rc_engage_z> = ${config.engageZ}
(print,Engage Z: #<_rc_engage_z>)

; The Z machine coordinate position at which to start the spindle when loading.
#<_rc_load_spin_z> = ${config.loadSpinZ}
(print,Load Spindle Start Z: #<_rc_load_spin_z>)

; The number of times to plunge when loading.
#<_rc_plunge_count> = ${config.plungeCount}
(print,Load Plunge Count: #<_rc_plunge_count>)

; The Z machine coordinate position to rise to after unloading, before moving to load. (No Tool Loaded RV)
#<_rc_to_load_z> = ${config.toLoadZ}
(print,Move To Load Z: #<_rc_to_load_z>)

; The Z machine coordinate position to rise to after loading, before moving to meeasure.
#<_rc_to_measure_z> = ${config.toMeasureZ}
(print,Move To Measure Z: #<_rc_to_measure_z>)

; The Z machine coordinate position for clearing all obstacles.
#<_rc_safe_z> = ${config.safeZ}
(print,Safe Clearance Z: #<_rc_safe_z>)

; The feed rate for engagement.
#<_rc_engage_feed> = ${config.engageFeed}
(print,Engage Feed Rate: #<_rc_engage_feed>)

; Spindle speed CCW
#<_rc_unload_rpm> = ${config.unloadRpm}
(print,Unload RPM: #<_rc_unload_rpm>)

; Spindle speed CW
#<_rc_load_rpm> = ${config.loadRpm}
(print,Load RPM: #<_rc_load_rpm>)

; Manual Tool Change
; X and Y machine coordinates to move to for a manual load/unload.
#<_rc_manual_x> = ${config.manualX}
(print,Manual X: #<_rc_manual_x>)
#<_rc_manual_y> = ${config.manualY}
(print,Manual Y: #<_rc_manual_y>)

; Dust Cover
; The dust cover operational mode: 0 = Disabled, 1 = Axis, 2 = Output
#<_rc_cover_mode> = ${config.coverMode}
(print,Dust Cover Mode: #<_rc_cover_mode>)

; The axis for axis mode: 3 = A Axis, 4 = B Axis, 5 = C Axis
#<_rc_cover_axis> = ${config.coverAxis}
(print,Dust Cover Axis: #<_rc_cover_axis>)

; The machine coordinate closed position for axis mode.
#<_rc_cover_c_pos> = ${config.coverClosedPos}
(print,Dust Cover Closed Pos: #<_rc_cover_c_pos>)

; The machine coordinate open position for axis mode.
#<_rc_cover_o_pos> = ${config.coverOpenPos}
(print,Dust Cover Open Pos: #<_rc_cover_o_pos>)

; The output number for output mode.
#<_rc_cover_output> = ${config.coverOutput}
(print,Dust Cover Output: #<_rc_cover_output>)

; The time to dwell in output mode to allow the cover to fully open/close before moving.
#<_rc_cover_dwell> = ${config.coverDwell}
(print,Dust Cover Dwell: #<_rc_cover_dwell>)

; Tool Recognition
; Tool recognition mode: 0 = Disabled-User confirmation only, 1 = Enabled
#<_rc_recognize> = ${config.recognizeEnabled ? 1 : 0}
(print,Tool Recognition Enabled: #<_rc_recognize>)

; IR sensor input number.
#<_rc_rec_input> = ${config.recInput}
(print,Tool Recognition Input: #<_rc_rec_input>)

; Z Machine coordinate positions tool recognition.
#<_rc_zone_one_z> = ${config.zoneOneZ}
(print,Tool Recognition Zone 1 Z: #<_rc_zone_one_z>)
#<_rc_zone_two_z> = ${config.zoneTwoZ}
(print,Tool Recognition Zone 2 Z: #<_rc_zone_two_z>)

; Tool Measurement
; Tool measurement mode: 0 = Disabled, 1 = Enabled
#<_rc_measure> = ${config.measureEnabled ? 1 : 0}
(print,Tool Measure Enabled: #<_rc_measure>)

`;

    if (config.measureEnabled) {
        content += `; X and Y machine coordinate positions of the tool setter.
#<_rc_measure_x> = ${config.measureX}
(print,Tool Measure X: #<_rc_measure_x>)
#<_rc_measure_y> = ${config.measureY}
(print,Tool Measure Y: #<_rc_measure_y>)

; Z machine coordinate position at which to begin the initial probe.
#<_rc_measure_start_z> = ${config.measureStartZ}
(print,Tool Measure Start Z: #<_rc_measure_start_z>)

; The distance to probe in search of the tool setter for the initial probe.
#<_rc_seek_dist> = ${config.seekDistance}
(print,Tool Measure Seek Distance: #<_rc_seek_dist>)

; The distance to retract after the initial probe trigger.
#<_rc_retract_dist> = ${config.retractDistance}

(print,Tool Measure Retract Distance: #<_rc_retract_dist>)

; The feed rate for the initial probe.
#<_rc_seek_feed> = ${config.seekFeed}
(print,Tool Measure Seek Feed Rate: #<_rc_seek_feed>)

; The feed rate for the second probe.
#<_rc_set_feed> = ${config.setFeed}
(print,Tool Measure Set Feed Rate: #<_rc_set_feed>)

; The optional reference position for TLO. This may remain at it's default of 0 or be customized.
#<_rc_tlo_ref> = ${config.tloRef}
(print,Tool Measure TLO Ref Pos: #<_rc_tlo_ref>)
`;
    }

    content += `; ********* END USER CONFIGURATION *********

; ******** BEGIN CALCULATED SETTINGS *********
; ******** DO NOT ALTER THIS SECTION *********
; Set static offsets
; These calculated offsets are consumed by RapidChange macros.
o100 if [#<_rc_units> EQ 20]
  #<_rc_z_spin_off> = 0.91
  #<_rc_z_retreat_off> = 0.47
  #<_rc_set_distance> = [#<_rc_retract_dist> + 0.04]
  (print,Static offsets set for inches)
o100 else
  #<_rc_z_spin_off> = 23
  #<_rc_z_retreat_off> = 12
  #<_rc_set_distance> = [#<_rc_retract_dist> + 1]
  (print,Static offsets set for millimeters)
o100 endif


; The flag indicating that the settings have been loaded into memory.
#1001 = 1
(print,Flag Set: #1001)
(print,RapidChange ATC Configuration Loaded)
; ******** END CALCULATED SETTINGS ***********
(print, Current tool #<_current_tool> Selected Tool #<_selected_tool> 5400 #5400)
;#<_rc_tool1_offset_referenced> = 0
;#<_rc_tool1_offset> = 0
G43.1 Z0`;

    return content;
}

function generateFluidNCToolChange() {
    return `; ************ BEGIN VALIDATION ************
o50 if [#1001 NE 1]
	(print, RapidChange settings are not initialized.)
	(print, Abort operation and initialize RapidChange settings.)
	$Alarm/Send=3
o50 elseif [#<_selected_tool> LT 0]
	(print, Selected Tool: #<_selected_tool> is out of range. Tool change aborted. Program paused.)
	$Alarm/Send=3
o50 elseif [#<_selected_tool> EQ #<_current_tool>]
	(print, Current tool selected. Tool change bypassed.)
o50 else
	(print, Tool change validated)
	; ************* END VALIDATION *************

	; ************** BEGIN SETUP ***************
	; Turn off spindle and coolant
	M5
	M9
	(print, Spindle and coolant turned off)

	; Record current units
	o200 if [#<_metric> EQ 0]
		#<_rc_return_units> = 20
	o200 else
		#<_rc_return_units> = 21
	o200 endif
	(print, Units recorded)

	; Activate configured units and absolute distance mode
	G[#<_rc_units>] G90
	(print, Set units and distance)

	; Magazine determination logic for ${config.magazineCount} magazines
	${generateFluidNCMagazineDeterminationLogic()}

	(print, "=== TOOL CHANGE START ===")
	(print, "Current tool      = #<_current_tool>")
	(print, "Requested tool    = #<_selected_tool>")
	(print, "Current magazine  = #<_current_magazine>")
	(print, "Selected magazine = #<_selected_magazine>")
	(print, "Unload X position = #<_rc_x_unload>")
	(print, "Unload Y position = #<_rc_y_unload>")
	(print, "Load X position   = #<_rc_x_load>")
	(print, "Load Y position   = #<_rc_y_load>")

	G53 G0 Z[#<_rc_safe_z>]
	(print, Moved to safe clearance)

	; Open the dust cover if enabled.
	o500 if [#<_rc_cover_mode> EQ 1]
		; Axis Mode: move along the configured axis to the open position.
		o510 if [#<_rc_cover_axis> EQ 3]
			G53 G0 A[#<_rc_cover_o_pos>]
		o510 elseif [#<_rc_cover_axis> EQ 4]
			G53 G0 B[#<_rc_cover_o_pos>]
		o510 elseif [#<_rc_cover_axis> EQ 5]
			G53 G0 C[#<_rc_cover_o_pos>]
	  o510 endif
	o500 elseif [#<_rc_cover_mode> EQ 2]
	  ; Output Mode: Turn on the output and dwell
	  G4 P0.05
	  M65 P[#<_rc_cover_output>]
	  G4 P[#<_rc_cover_dwell>]
	o500 endif
	; *************** END SETUP ****************

	; ************** BEGIN UNLOAD **************
	; Unload current tool
	o300 if [#<_current_tool> EQ 0 ]
		; We have tool 0. Do nothing as we are already unloaded.
		(print, Unloaded tool 0)
	o300 elseif [#<_current_tool> GT ${generateTotalPockets()}]
		; Tool out of magazine range. Unload manually
		G53 G0 X[#<_rc_manual_x>] Y[#<_rc_manual_y>]
		(print, Tool #<_current_tool> is out of magazine range. Manually remove tool #<_current_tool> and cycle start to continue.)
		M0
		(print, Unloaded tool out of range)
	o300 else
		; We have a tool with a pocket
		G53 G0 X[#<_rc_x_unload>] Y[#<_rc_y_unload>]
		(print, Move to pocket #<_current_tool>)
		(print, Unloading tool at X[#<_rc_x_unload>] Y[#<_rc_y_unload>])
		G53 G0 Z[#<_rc_engage_z> + #<_rc_z_spin_off>]
		(print, Move to spin start)
		M4 S[#<_rc_unload_rpm>]
		(print, Run spindle CCW)
		G4 P3
		(print, Wait 3 seconds for spindle to get to rpm)
		G53 G1 Z[#<_rc_engage_z>] F[#<_rc_engage_feed>]
		(print, Engage)
		G53 G1 Z[#<_rc_engage_z> + #<_rc_z_retreat_off>] F[#<_rc_engage_feed>]
		(print, Retreat)
	  
		; Confirm tool unloaded
		o310 if [#<_rc_recognize> EQ 1]
			G53 G0 Z[#<_rc_zone_one_z>]
			(print, Move to zone 1)
			G4 P0.05
			M66 P[#<_rc_rec_input>] L0
			(print, Read input: #5399)

			o320 if [#5399 EQ 1]
				(print, Input read timed out)
				G53 G0 Z[#<_rc_engage_z> + #<_rc_z_spin_off>]
				(print, Go to spindle start)
				G53 G1 Z[#<_rc_engage_z>] F[#<_rc_engage_feed>]
				(print, Engage)
				G53 G1 Z[#<_rc_engage_z> + #<_rc_z_retreat_off>] F[#<_rc_engage_feed>]
				(print, Retreat)
				M5
				G53 G0 Z[#<_rc_zone_one_z>]
				(print, Move to zone 1)
				G4 P0.05
				M66 P[#<_rc_rec_input>] L0
				(print, Input read again: #5399)
				o330 if [#5399 EQ 1]
					(print, Input read timed out again)
					G53 G0 Z[#<_rc_safe_z>]
					(print, Go to safe clearance)
					G53 G0 X[#<_rc_manual_x>] Y[#<_rc_manual_y>]
					(print, Tool #<_current_tool> failed to unload. Please manually unload tool #<_current_tool> and cycle start to continue.)
					M0
				o330 else
					G53 G0 Z[#<_rc_to_load_z>]
					(print, Go to move to load)
				o330 endif
			o320 else
				M5
				G53 G0 Z[#<_rc_to_load_z>]
				(print, Go to move to load)
			o320 endif
		o310 else
			M5
			(print, Stop spindle)
			G53 G0 Z[#<_rc_to_load_z>]
			(print, Go to move to load)
			(print, Confirm tool #<_current_tool> is unloaded and press cycle start to continue.)
			M0
		o310 endif
	o300 endif
	; *************** END UNLOAD ***************

	; *************** BEGIN LOAD ***************
	o400 if [[#<_selected_tool> EQ 0]]
		; We selected tool tool 0.
		; Go to safe z.
		G53 G0 Z[#<_rc_safe_z>]
		(print, Moved to safe clearance)
        ; reset TLO to 0
        G43.1 Z0
        (print, G43.1 Z offset removed)
        M61 Q0
        #<_rc_tool1_offset> = 0
        #<_rc_tool1_offset_referenced> = 0
	o400 elseif [#<_selected_tool> LE ${generateTotalPockets()}]
		; We have a tool with a pocket
		o401 if [#<_selected_magazine> EQ #<_current_magazine>]
			G53 G0 X[#<_rc_x_load>] Y[#<_rc_y_load>]
		o401 else
			G53 G0 Z[#<_rc_safe_z>]
			G53 G0 X[#<_rc_x_load>] Y[#<_rc_y_load>]
		o401 endif
		(print, Move to pocket #<_selected_tool>)
		G53 G0 Z[#<_rc_engage_z> + #<_rc_z_spin_off>]
		(print, Move to spin start)
		G53 G1 Z[#<_rc_load_spin_z>] F[#<_rc_engage_feed>]
		M3 S[#<_rc_load_rpm>]
		(print, Run spindle CW)
		G4 P3
		(print, Wait 3 seconds for spindle to get to rpm)

		#<_rc_times_plunged> = 0
		o410 while [#<_rc_times_plunged> LT #<_rc_plunge_count>]
			G53 G1 Z[#<_rc_engage_z>] F[#<_rc_engage_feed>]
			(print, Engage)
			G53 G1 Z[#<_rc_engage_z> + #<_rc_z_retreat_off>] F[#<_rc_engage_feed>]
			(print, Retreat)
			#<_rc_times_plunged> = [#<_rc_times_plunged> + 1]
			(print, Load plunge #<_rc_times_plunged> complete)
			G4 P1.5
			(print, Wait 1.5 seconds for spindle to get to rpm)
		o410 endwhile

		M5
		(print, Stop spindle)

		; Confirm Load
		o420 if [#<_rc_recognize> EQ 1]
			(print, Tool Recognition Enabled)
			G53 G0 Z[#<_rc_zone_one_z>]
			(print, Move to zone 1)
			G4 P0.05
			M66 P[#<_rc_rec_input>] L0
			(print, Read input: #5399)

			o430 if [#5399 EQ 0]
				(print, Failed Zone 1)
				G53 G0 Z[#<_rc_safe_z>]
				(print, Moved to safe clearance)
				G53 G0 X[#<_rc_manual_x>] Y[#<_rc_manual_y>]
				(print, Tool #<_selected_tool> failed to load zone 1. Manually load tool #<_selected_tool> and cycle start to continue.)
				M0
				(print, Manually loaded tool after failure)
			o430 else
				(print, Passed Zone 1)
				G53 G0 Z[#<_rc_zone_two_z>]
				(print, Move to zone 2)
				G4 P0.05
				M66 P[#<_rc_rec_input>] L0
				(print, Read input: #5399)
				o440 if [#5399 EQ 1]
					G53 G0 Z[#<_rc_safe_z>]
					(print, Moved to safe clearance)
					G53 G0 X[#<_rc_manual_x>] Y[#<_rc_manual_y>]
					(print, Tool #<_selected_tool> failed to load Zone 2. Manually load tool #<_selected_tool> and cycle start to continue.)
					M0
					(print, Manually loaded tool after failure)
				o440 else
					G53 G0 Z[#<_rc_to_measure_z>]
					(print, Move to measure z)
				o440 endif
			o430 endif
		o420 else
			(print, Tool recognition disabled)
			G53 G0 Z[#<_rc_to_measure_z>]
			(print, Move to measure z)
			(print, Confirm tool #<_selected_tool> is loaded and press cycle start to continue.)
			M0
		o420 endif
	o400 else
		; Tool out of magazine range. Load manually
		G53 G0 Z[#<_rc_safe_z>]
		G53 G0 X[#<_rc_manual_x>] Y[#<_rc_manual_y>]
		(print, Tool #<_selected_tool> is out of magazine range. Manually load tool #<_selected_tool> and cycle start to continue.)
		M0
		(print, Loaded tool out of range)
	o400 endif

	; Update the current tool.
    M61 Q[#<_selected_tool>]
	G4 P0.05
	(print, Loaded tool #<_current_tool>)
	; *************** END LOAD *****************

	; ************* BEGIN MEASURE **************
	o600 if [#<_rc_measure> EQ 1 AND #<_current_tool> NE 0]
		; Tool measure is enabled and we have a tool.
		G53 G90 G0 Z[#<_rc_safe_z>]
		(print, Move to Z safe)
		G53 G0 X[#<_rc_measure_x>] Y[#<_rc_measure_y>]
		(print, Move to tool setter XY)
		G53 G0 Z[#<_rc_measure_start_z>]
		G4 P0.05
		(print, Down to Z seek start)
		G38.2 G91 Z[#<_rc_seek_dist> * -1] F[#<_rc_seek_feed>]
		(print, Probe Z down seek mode)
		G0 G91 Z[#<_rc_retract_dist>]
		(print, Retract from tool setter)
		G38.2 G91 Z[#<_rc_set_distance> * -1] F[#<_rc_set_feed>]
		(print, Probe Z down set mode)
		G53 G0 G90 Z[#<_rc_safe_z>]
		(print, Triggered Work Z: #5063)

		o620 if[#<_rc_tool1_offset_referenced> EQ 0]
			#<_rc_tool1_offset> = #5063
			#<_rc_tool1_offset_referenced> = 1
	        (print, first tool referenced)
		o620 else
			#<_rc_trigger_mach_z> = [#5063 - #<_rc_tool1_offset>]
			(print, 5063: #5063)
			(print, tool1 offset #<_rc_tool1_offset>)
			(print, Triggered Mach Z: #<_rc_trigger_mach_z>)
			G4 P0.05
			G43.1 Z[#<_rc_trigger_mach_z>]
			(print, Ref Mach Pos: 0, Work Z after G43.1: #<_z>)
		o620 endif
	o600 else
		; Tool measure is disabled
		(print, Tool measurement disabled)
		G53 G0 Z[#<_rc_safe_z>]
		(print, Moved to safe clearance)
	o600 endif
	; ************* END MEASURE ****************

	; ************ BEGIN TEARDOWN **************
	; Close the dust cover if enabled.
	o550 if [#<_rc_cover_mode> EQ 1]
		; Axis Mode: move along the configured axis to the close position.
		o560 if [#<_rc_cover_axis> EQ 3]
			G53 G0 A[#<_rc_cover_c_pos>]
		o560 elseif [#<_rc_cover_axis> EQ 4]
			G53 G0 B[#<_rc_cover_c_pos>]
		o560 elseif [#<_rc_cover_axis> EQ 5]
			G53 G0 C[#<_rc_cover_c_pos>]
		o560 endif
	o550 elseif [#<_rc_cover_mode> EQ 2]
		; Output Mode: Turn off the output and dwell
		G4 P0.05
		M64 P[#<_rc_cover_output>]
		G4 P[#<_rc_cover_dwell>]
		(print, Dwell for cover)
	o550 endif

	; Restore units
	G[#<_rc_return_units>]
	(print, Units restored)
	(print, Tool change complete)

o50 endif
; ************* END TEARDOWN ***************`;
}

function generateTotalPockets() {
    const pocketVars = [];
    for (let i = 1; i <= config.magazineCount; i++) {
        pocketVars.push(`#<_rc${i}_pockets>`);
    }
    return `[${pocketVars.join(' + ')}]`;
}

function generateFluidNCMagazineDeterminationLogic() {
    let logic = '';
    let totalPockets = 0;
    
    logic += `	; Determine current magazine and unload position based on current tool number\n`;
    
    for (let i = 0; i < config.magazineCount; i++) {
        const mag = config.magazines[i];
        const magNum = i + 1;
        const previousTotal = totalPockets;
        totalPockets += mag.pockets;
        
        if (i === 0) {
            logic += `	o205 if [#<_current_tool> LE #<_rc${magNum}_pockets>]
  		#<_current_magazine> = ${magNum}
  		(print, Current tool in magazine #<_current_magazine>)
		o211 if [#<_rc${magNum}_alignment> EQ 0]
			#<_rc_x_unload> = [[[#<_current_tool> - 1] * #<_rc_pocket_offset> * #<_rc${magNum}_direction>] + #<_rc${magNum}_pckt_one_x>]
			(print, Unload X set to #<_rc_x_unload> for magazine ${magNum})
			#<_rc_y_unload> = #<_rc${magNum}_pckt_one_y>
			(print, Unload Y set to #<_rc_y_unload> for magazine ${magNum})
		o211 else
			#<_rc_x_unload> = #<_rc${magNum}_pckt_one_x>
			(print, Unload X set to #<_rc_x_unload> for magazine ${magNum})
			#<_rc_y_unload> = [[[#<_current_tool> - 1] * #<_rc_pocket_offset> * #<_rc${magNum}_direction>] + #<_rc${magNum}_pckt_one_y>]
			(print, Unload Y set to #<_rc_y_unload> for magazine ${magNum}, Y alignment)
		o211 endif
`;
        } else if (i === config.magazineCount - 1) {
            logic += `	o205 else 
		#<_current_magazine> = ${magNum}
		(print, Current tool in magazine #<_current_magazine>)
		(print, Unloading from magazine #<_current_magazine>)
		o21${magNum} if [#<_rc${magNum}_alignment> EQ 0]
			#<_temp1> = [${previousTotal} + 1]
			#<_temp2> = [#<_current_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc${magNum}_direction>]
			#<_rc_x_unload> = [#<_temp4> + #<_rc${magNum}_pckt_one_x>]
			(print, Unload X set to #<_rc_x_unload> for magazine ${magNum})
			#<_rc_y_unload> = #<_rc${magNum}_pckt_one_y>
			(print, Unload Y set to #<_rc_y_unload> for magazine ${magNum})
		o21${magNum} else
			#<_rc_x_unload> = #<_rc${magNum}_pckt_one_x>
			(print, Unload X set to #<_rc_x_unload> for magazine ${magNum})
			#<_temp1> = [${previousTotal} + 1]
			#<_temp2> = [#<_current_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc${magNum}_direction>]
			#<_rc_y_unload> = [#<_temp4> + #<_rc${magNum}_pckt_one_y>]
			(print, Unload Y set to #<_rc_y_unload> for magazine ${magNum}, Y alignment)
		o21${magNum} endif
	o205 endif
`;
        } else {
            logic += `	o205 elseif [#<_current_tool> GT ${previousTotal} AND #<_current_tool> LE ${totalPockets}]
  		#<_current_magazine> = ${magNum}
  		(print, Current tool in magazine #<_current_magazine>)
		(print, Unloading from magazine #<_current_magazine>)
		o21${magNum} if [#<_rc${magNum}_alignment> EQ 0]
			#<_temp1> = [${previousTotal} + 1]
			#<_temp2> = [#<_current_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc${magNum}_direction>]
			#<_rc_x_unload> = [#<_temp4> + #<_rc${magNum}_pckt_one_x>]
			(print, Unload X set to #<_rc_x_unload> for magazine ${magNum})
			#<_rc_y_unload> = #<_rc${magNum}_pckt_one_y>
			(print, Unload Y set to #<_rc_y_unload> for magazine ${magNum})
		o21${magNum} else
			#<_rc_x_unload> = #<_rc${magNum}_pckt_one_x>
			(print, Unload X set to #<_rc_x_unload> for magazine ${magNum})
			#<_temp1> = [${previousTotal} + 1]
			#<_temp2> = [#<_current_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc${magNum}_direction>]
			#<_rc_y_unload> = [#<_temp4> + #<_rc${magNum}_pckt_one_y>]
			(print, Unload Y set to #<_rc_y_unload> for magazine ${magNum}, Y alignment)
		o21${magNum} endif
`;
        }
    }
    
    // Generate selected magazine determination logic with load positions
    logic += '\n	; Determine selected magazine and load position based on selected tool number\n';
    totalPockets = 0;
    
    for (let i = 0; i < config.magazineCount; i++) {
        const mag = config.magazines[i];
        const magNum = i + 1;
        const previousTotal = totalPockets;
        totalPockets += mag.pockets;
        
        if (i === 0) {
            logic += `	o206 if [#<_selected_tool> LE #<_rc${magNum}_pockets>]
  		#<_selected_magazine> = ${magNum}
  		(print, Selected tool in magazine #<_selected_magazine>)
		o221 if [#<_rc${magNum}_alignment> EQ 0]
			#<_rc_x_load> = [[[#<_selected_tool> - 1] * #<_rc_pocket_offset> * #<_rc${magNum}_direction>] + #<_rc${magNum}_pckt_one_x>]
			(print, Load X set to #<_rc_x_load> for magazine ${magNum})
			#<_rc_y_load> = #<_rc${magNum}_pckt_one_y>
			(print, Load Y set to #<_rc_y_load> for magazine ${magNum})
		o221 else
			#<_rc_x_load> = #<_rc${magNum}_pckt_one_x>
			(print, Load X set to #<_rc_x_load> for magazine ${magNum})
			#<_rc_y_load> = [[[#<_selected_tool> - 1] * #<_rc_pocket_offset> * #<_rc${magNum}_direction>] + #<_rc${magNum}_pckt_one_y>]
			(print, Load Y set to #<_rc_y_load> for magazine ${magNum}, Y alignment)
		o221 endif
`;
        } else if (i === config.magazineCount - 1) {
            logic += `	o206 else 
		#<_selected_magazine> = ${magNum}
		(print, Selected tool in magazine #<_selected_magazine>)
		(print, Loading from magazine #<_selected_magazine>)
		o22${magNum} if [#<_rc${magNum}_alignment> EQ 0]
			#<_temp1> = [${previousTotal} + 1]
			(print, Temp1: #<_temp1>)
			#<_temp2> = [#<_selected_tool> - #<_temp1>]
			(print, Temp2: #<_temp2>)
			#<_temp3> = [#<_temp2> * #<_rc_pocket_offset>]
			(print, Temp3: #<_temp3>)
			#<_temp4> = [#<_temp3> * #<_rc${magNum}_direction>]
			(print, Temp4: #<_temp4>)
			#<_rc_x_load> = [#<_temp4> + #<_rc${magNum}_pckt_one_x>]
			(print, Load X set to #<_rc_x_load> for magazine ${magNum})
			#<_rc_y_load> = #<_rc${magNum}_pckt_one_y>
			(print, Load Y set to #<_rc_y_load> for magazine ${magNum})
		o22${magNum} else
			#<_rc_x_load> = #<_rc${magNum}_pckt_one_x>
			(print, Load X set to #<_rc_x_load> for magazine ${magNum})
			#<_temp1> = [${previousTotal} + 1]
			#<_temp2> = [#<_selected_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc${magNum}_direction>]
			#<_rc_y_load> = [#<_temp4> + #<_rc${magNum}_pckt_one_y>]
			(print, Load Y set to #<_rc_y_load> for magazine ${magNum}, Y alignment)
		o22${magNum} endif
	o206 endif
`;
        } else {
            logic += `	o206 elseif [#<_selected_tool> GT ${previousTotal} AND #<_selected_tool> LE ${totalPockets}]
  		#<_selected_magazine> = ${magNum}
  		(print, Selected tool in magazine #<_selected_magazine>)
		(print, Loading from magazine #<_selected_magazine>)
		o22${magNum} if [#<_rc${magNum}_alignment> EQ 0]
			#<_temp1> = [${previousTotal} + 1]
			(print, Temp1: #<_temp1>)
			#<_temp2> = [#<_selected_tool> - #<_temp1>]
			(print, Temp2: #<_temp2>)
			#<_temp3> = [#<_temp2> * #<_rc_pocket_offset>]
			(print, Temp3: #<_temp3>)
			#<_temp4> = [#<_temp3> * #<_rc${magNum}_direction>]
			(print, Temp4: #<_temp4>)
			#<_rc_x_load> = [#<_temp4> + #<_rc${magNum}_pckt_one_x>]
			(print, Load X set to #<_rc_x_load> for magazine ${magNum})
			#<_rc_y_load> = #<_rc${magNum}_pckt_one_y>
			(print, Load Y set to #<_rc_y_load> for magazine ${magNum})
		o22${magNum} else
			#<_rc_x_load> = #<_rc${magNum}_pckt_one_x>
			(print, Load X set to #<_rc_x_load> for magazine ${magNum})
			#<_temp1> = [${previousTotal} + 1]
			#<_temp2> = [#<_selected_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc${magNum}_direction>]
			#<_rc_y_load> = [#<_temp4> + #<_rc${magNum}_pckt_one_y>]
			(print, Load Y set to #<_rc_y_load> for magazine ${magNum}, Y alignment)
		o22${magNum} endif
`;
        }
    }
    
    return logic;
}

function generateGrblHALMagazineDeterminationLogic() {
    let logic = '';
    let totalPockets = 0;
    
    logic += `	; Determine current magazine and unload position based on current tool number\n`;
    
    for (let i = 0; i < config.magazineCount; i++) {
        const mag = config.magazines[i];
        const magNum = i + 1;
        const previousTotal = totalPockets;
        totalPockets += mag.pockets;
        
        if (i === 0) {
            logic += `	o205 if [#<_current_tool> LE #<_rc${magNum}_pockets>]
  		#<_current_magazine> = ${magNum}
  		(debug, Current tool in magazine #<_current_magazine>)
		o211 if [#<_rc${magNum}_alignment> EQ 0]
			#<_rc_x_unload> = [[[#<_current_tool> - 1] * #<_rc${magNum}_pocket_offset> * #<_rc${magNum}_direction>] + #<_rc${magNum}_pocket_one_x>]
			(debug, Unload X set to #<_rc_x_unload> for magazine ${magNum})
			#<_rc_y_unload> = #<_rc${magNum}_pocket_one_y>
			(debug, Unload Y set to #<_rc_y_unload> for magazine ${magNum})
		o211 else
			#<_rc_x_unload> = #<_rc${magNum}_pocket_one_x>
			(debug, Unload X set to #<_rc_x_unload> for magazine ${magNum})
			#<_rc_y_unload> = [[[#<_current_tool> - 1] * #<_rc${magNum}_pocket_offset> * #<_rc${magNum}_direction>] + #<_rc${magNum}_pocket_one_y>]
			(debug, Unload Y set to #<_rc_y_unload> for magazine ${magNum}, Y alignment)
		o211 endif
`;
        } else if (i === config.magazineCount - 1) {
            logic += `	o205 else 
		#<_current_magazine> = ${magNum}
		(debug, Current tool in magazine #<_current_magazine>)
		o21${magNum} if [#<_rc${magNum}_alignment> EQ 0]
			#<_temp1> = [${previousTotal} + 1]
			#<_temp2> = [#<_current_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc${magNum}_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc${magNum}_direction>]
			#<_rc_x_unload> = [#<_temp4> + #<_rc${magNum}_pocket_one_x>]
			(debug, Unload X set to #<_rc_x_unload> for magazine ${magNum})
			#<_rc_y_unload> = #<_rc${magNum}_pocket_one_y>
			(debug, Unload Y set to #<_rc_y_unload> for magazine ${magNum})
		o21${magNum} else
			#<_rc_x_unload> = #<_rc${magNum}_pocket_one_x>
			(debug, Unload X set to #<_rc_x_unload> for magazine ${magNum})
			#<_temp1> = [${previousTotal} + 1]
			#<_temp2> = [#<_current_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc${magNum}_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc${magNum}_direction>]
			#<_rc_y_unload> = [#<_temp4> + #<_rc${magNum}_pocket_one_y>]
			(debug, Unload Y set to #<_rc_y_unload> for magazine ${magNum}, Y alignment)
		o21${magNum} endif
	o205 endif
`;
        } else {
            logic += `	o205 elseif [#<_current_tool> GT ${previousTotal} AND #<_current_tool> LE ${totalPockets}]
  		#<_current_magazine> = ${magNum}
  		(debug, Current tool in magazine #<_current_magazine>)
		o21${magNum} if [#<_rc${magNum}_alignment> EQ 0]
			#<_temp1> = [${previousTotal} + 1]
			#<_temp2> = [#<_current_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc${magNum}_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc${magNum}_direction>]
			#<_rc_x_unload> = [#<_temp4> + #<_rc${magNum}_pocket_one_x>]
			(debug, Unload X set to #<_rc_x_unload> for magazine ${magNum})
			#<_rc_y_unload> = #<_rc${magNum}_pocket_one_y>
			(debug, Unload Y set to #<_rc_y_unload> for magazine ${magNum})
		o21${magNum} else
			#<_rc_x_unload> = #<_rc${magNum}_pocket_one_x>
			(debug, Unload X set to #<_rc_x_unload> for magazine ${magNum})
			#<_temp1> = [${previousTotal} + 1]
			#<_temp2> = [#<_current_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc${magNum}_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc${magNum}_direction>]
			#<_rc_y_unload> = [#<_temp4> + #<_rc${magNum}_pocket_one_y>]
			(debug, Unload Y set to #<_rc_y_unload> for magazine ${magNum}, Y alignment)
		o21${magNum} endif
`;
        }
    }
    
    // Generate selected magazine determination logic with load positions
    logic += '\n	; Determine selected magazine and load position based on selected tool number\n';
    totalPockets = 0;
    
    for (let i = 0; i < config.magazineCount; i++) {
        const mag = config.magazines[i];
        const magNum = i + 1;
        const previousTotal = totalPockets;
        totalPockets += mag.pockets;
        
        if (i === 0) {
            logic += `	o206 if [#<_selected_tool> LE #<_rc${magNum}_pockets>]
  		#<_selected_magazine> = ${magNum}
  		(debug, Selected tool in magazine #<_selected_magazine>)
		o221 if [#<_rc${magNum}_alignment> EQ 0]
			#<_rc_x_load> = [[[#<_selected_tool> - 1] * #<_rc${magNum}_pocket_offset> * #<_rc${magNum}_direction>] + #<_rc${magNum}_pocket_one_x>]
			(debug, Load X set to #<_rc_x_load> for magazine ${magNum})
			#<_rc_y_load> = #<_rc${magNum}_pocket_one_y>
			(debug, Load Y set to #<_rc_y_load> for magazine ${magNum})
		o221 else
			#<_rc_x_load> = #<_rc${magNum}_pocket_one_x>
			(debug, Load X set to #<_rc_x_load> for magazine ${magNum})
			#<_rc_y_load> = [[[#<_selected_tool> - 1] * #<_rc${magNum}_pocket_offset> * #<_rc${magNum}_direction>] + #<_rc${magNum}_pocket_one_y>]
			(debug, Load Y set to #<_rc_y_load> for magazine ${magNum}, Y alignment)
		o221 endif
`;
        } else if (i === config.magazineCount - 1) {
            logic += `	o206 else 
		#<_selected_magazine> = ${magNum}
		(debug, Selected tool in magazine #<_selected_magazine>)
		o22${magNum} if [#<_rc${magNum}_alignment> EQ 0]
			#<_temp1> = [${previousTotal} + 1]
			#<_temp2> = [#<_selected_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc${magNum}_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc${magNum}_direction>]
			#<_rc_x_load> = [#<_temp4> + #<_rc${magNum}_pocket_one_x>]
			(debug, Load X set to #<_rc_x_load> for magazine ${magNum})
			#<_rc_y_load> = #<_rc${magNum}_pocket_one_y>
			(debug, Load Y set to #<_rc_y_load> for magazine ${magNum})
		o22${magNum} else
			#<_rc_x_load> = #<_rc${magNum}_pocket_one_x>
			(debug, Load X set to #<_rc_x_load> for magazine ${magNum})
			#<_temp1> = [${previousTotal} + 1]
			#<_temp2> = [#<_selected_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc${magNum}_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc${magNum}_direction>]
			#<_rc_y_load> = [#<_temp4> + #<_rc${magNum}_pocket_one_y>]
			(debug, Load Y set to #<_rc_y_load> for magazine ${magNum}, Y alignment)
		o22${magNum} endif
	o206 endif
`;
        } else {
            logic += `	o206 elseif [#<_selected_tool> GT ${previousTotal} AND #<_selected_tool> LE ${totalPockets}]
  		#<_selected_magazine> = ${magNum}
  		(debug, Selected tool in magazine #<_selected_magazine>)
		o22${magNum} if [#<_rc${magNum}_alignment> EQ 0]
			#<_temp1> = [${previousTotal} + 1]
			#<_temp2> = [#<_selected_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc${magNum}_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc${magNum}_direction>]
			#<_rc_x_load> = [#<_temp4> + #<_rc${magNum}_pocket_one_x>]
			(debug, Load X set to #<_rc_x_load> for magazine ${magNum})
			#<_rc_y_load> = #<_rc${magNum}_pocket_one_y>
			(debug, Load Y set to #<_rc_y_load> for magazine ${magNum})
		o22${magNum} else
			#<_rc_x_load> = #<_rc${magNum}_pocket_one_x>
			(debug, Load X set to #<_rc_x_load> for magazine ${magNum})
			#<_temp1> = [${previousTotal} + 1]
			#<_temp2> = [#<_selected_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc${magNum}_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc${magNum}_direction>]
			#<_rc_y_load> = [#<_temp4> + #<_rc${magNum}_pocket_one_y>]
			(debug, Load Y set to #<_rc_y_load> for magazine ${magNum}, Y alignment)
		o22${magNum} endif
`;
        }
    }
    
    return logic;
}

function generateGrblHALInit() {
    let content = `; ******** BEGIN USER CONFIGURATION ********
; ATC Operations
; The units for your configuration: 20 = Inches, 21 = Millimeters
#<_rc_units> = ${config.units}
(debug, Units: #<_rc_units>)

`;

    // Magazine pocket configuration for up to 9 magazines
    for (let i = 0; i < config.magazineCount; i++) {
        const mag = config.magazines[i];
        const magNum = i + 1;
        
        if (i === 0) {
            content += `; The number of pockets in your magazine.
#<_rc${magNum}_pockets> = ${mag.pockets}
(debug, Pockets: #<_rc${magNum}_pockets>)
`;
        } else if (i === 1) {
            content += `; The number of pockets in the secondary module.
#<_rc${magNum}_pockets> = ${mag.pockets}
(debug, Secondary Pockets: #<_rc${magNum}_pockets>)
`;
        } else {
            content += `; The number of pockets in the ${getOrdinal(magNum)} magazine.
#<_rc${magNum}_pockets> = ${mag.pockets}
(debug, Magazine ${magNum} Pockets: #<_rc${magNum}_pockets>)
`;
        }
    }

    content += '\n';

    // Pocket offset configuration for each magazine
    for (let i = 0; i < config.magazineCount; i++) {
        const mag = config.magazines[i];
        const magNum = i + 1;
        
        if (i === 0) {
            content += `; The pocket offset for your magazine.
#<_rc${magNum}_pocket_offset> = ${mag.pocketOffset}
(debug, Pocket Offset: #<_rc${magNum}_pocket_offset>)
`;
        } else if (i === 1) {
            content += `; The pocket offset for your second magazine.
#<_rc${magNum}_pocket_offset> = ${mag.pocketOffset}
(debug, Pocket Offset: #<_rc${magNum}_pocket_offset>)
`;
        } else {
            content += `; The pocket offset for your ${getOrdinal(magNum)} magazine.
#<_rc${magNum}_pocket_offset> = ${mag.pocketOffset}
(debug, Magazine ${magNum} Pocket Offset: #<_rc${magNum}_pocket_offset>)
`;
        }
    }

    content += '\n';

    // Alignment configuration for each magazine
    for (let i = 0; i < config.magazineCount; i++) {
        const mag = config.magazines[i];
        const magNum = i + 1;
        
        if (i === 0) {
            content += `; The axis along which the first magazine is aligned: 0 = X Axis, 1 = Y Axis.
#<_rc${magNum}_alignment> = ${mag.alignment}
(debug, Alignment: #<_rc${magNum}_alignment>)
`;
        } else if (i === 1) {
            content += `; The axis along which the second magazine is aligned: 0 = X Axis, 1 = Y Axis.
#<_rc${magNum}_alignment> = ${mag.alignment}
(debug, Alignment: #<_rc${magNum}_alignment>)
`;
        } else {
            content += `; The axis along which the ${getOrdinal(magNum)} magazine is aligned: 0 = X Axis, 1 = Y Axis.
#<_rc${magNum}_alignment> = ${mag.alignment}
(debug, Magazine ${magNum} Alignment: #<_rc${magNum}_alignment>)
`;
        }
    }

    content += '\n';

    // Direction configuration for each magazine
    for (let i = 0; i < config.magazineCount; i++) {
        const mag = config.magazines[i];
        const magNum = i + 1;
        
        content += `; The direction of travel from pocket 1 to pocket 2: 1 = Positive, -1 = Negative.
#<_rc${magNum}_direction> = ${mag.direction}
(debug, Direction: #<_rc${magNum}_direction>)
`;
    }

    content += '\n';

    // Position configuration for each magazine
    for (let i = 0; i < config.magazineCount; i++) {
        const mag = config.magazines[i];
        const magNum = i + 1;
        
        if (i === 0) {
            content += `; The X and Y machine coordinate positions of primary magazine pocket 1.
#<_rc${magNum}_pocket_one_x> = ${mag.pocketOneX}
(debug, Pocket ${magNum} X: #<_rc${magNum}_pocket_one_x>)
#<_rc${magNum}_pocket_one_y> = ${mag.pocketOneY}
(debug, Pocket ${magNum} Y: #<_rc${magNum}_pocket_one_y>)
`;
        } else if (i === 1) {
            content += `; The X and Y machine coordinate positions of secondary magazine pocket 1.
#<_rc${magNum}_pocket_one_x> = ${mag.pocketOneX}
(debug, Pocket ${magNum} X: #<_rc${magNum}_pocket_one_x>)
#<_rc${magNum}_pocket_one_y> = ${mag.pocketOneY}
(debug, Pocket ${magNum} Y: #<_rc${magNum}_pocket_one_y>)
`;
        } else {
            content += `; The X and Y machine coordinate positions of ${getOrdinal(magNum)} magazine pocket 1.
#<_rc${magNum}_pocket_one_x> = ${mag.pocketOneX}
(debug, Magazine ${magNum} Pocket 1 X: #<_rc${magNum}_pocket_one_x>)
#<_rc${magNum}_pocket_one_y> = ${mag.pocketOneY}
(debug, Magazine ${magNum} Pocket 1 Y: #<_rc${magNum}_pocket_one_y>)
`;
        }
        
        if (i < config.magazineCount - 1) content += '\n';
    }

    content += `
; The Z machine coordinate positon of engagement.
#<_rc_engage_z> = ${config.engageZ}
(debug, Engage Z: #<_rc_engage_z>)

; The Z machine coordinate position at which to start the spindle when loading.
#<_rc_load_spin_z> = ${config.loadSpinZ}
(debug, Load Spindle Start Z: #<_rc_load_spin_z>)

; The number of times to plunge when loading.
#<_rc_plunge_count> = ${config.plungeCount}
(debug, Load Plunge Count: #<_rc_plunge_count>)

; The Z machine coordinate position to rise to after unloading, before moving to load.
#<_rc_to_load_z> = ${config.toLoadZ}
(debug, Move To Load Z: #<_rc_to_load_z>)

; The Z machine coordinate position to rise to after loading, before moving to meeasure.
#<_rc_to_measure_z> = ${config.toMeasureZ}
(debug, Move To Measure Z: #<_rc_to_measure_z>)

; The Z machine coordinate position for clearing all obstacles.
#<_rc_safe_z> = ${config.safeZ}
(debug, Safe Clearance Z: #<_rc_safe_z>)

; The feed rate for engagement.
#<_rc_engage_feed> = ${config.engageFeed}
(debug, Engage Feed Rate: #<_rc_engage_feed>)

; Spindle speed CCW
#<_rc_unload_rpm> = ${config.unloadRpm}
(debug, Unload RPM: #<_rc_unload_rpm>)

; Spindle speed CW
#<_rc_load_rpm> = ${config.loadRpm}
(debug, Load RPM: #<_rc_load_rpm>)

; Manual Tool Change
; X and Y machine coordinates to move to for a manual load/unload.
#<_rc_manual_x> = ${config.manualX}
(debug, Manual X: #<_rc_manual_x>)
#<_rc_manual_y> = ${config.manualY}
(debug, Manual Y: #<_rc_manual_y>)

; Dust Cover
; The dust cover operational mode: 0 = Disabled, 1 = Axis, 2 = Output
#<_rc_cover_mode> = ${config.coverMode}
(debug, Dust Cover Mode: #<_rc_cover_mode>)

; The axis for axis mode: 3 = A Axis, 1 = B Axis, 2 = C Axis
#<_rc_cover_axis> = ${config.coverAxis}
(debug, Dust Cover Axis: #<_rc_cover_axis>)

; The machine coordinate closed position for axis mode.
#<_rc_cover_c_pos> = ${config.coverClosedPos}
(debug, Dust Cover Closed Pos: #<_rc_cover_c_pos>)

; The machine coordinate open position for axis mode.
#<_rc_cover_o_pos> = ${config.coverOpenPos}
(debug, Dust Cover Open Pos: #<_rc_cover_o_pos>)

; The output number for output mode.
#<_rc_cover_output> = ${config.coverOutput}
(debug, Dust Cover Output: #<_rc_cover_output>)

; The time to dwell in output mode to allow the cover to fully open/close before moving.
#<_rc_cover_dwell> = ${config.coverDwell}
(debug, Dust Cover Dwell: #<_rc_cover_dwell>)

; Tool Recognition
; Tool recognition mode: 0 = Disabled-User confirmation only, 1 = Enabled
#<_rc_recognize> = ${config.recognizeEnabled ? 1 : 0}
(debug, Tool Recognition Enabled: #<_rc_recognize>)

; IR sensor input number.
#<_rc_rec_input> = ${config.recInput}
(debug, Tool Recognition Input: #<_rc_rec_input>)

; Z Machine coordinate positions tool recognition.
#<_rc_zone_one_z> = ${config.zoneOneZ}
(debug, Tool Recognition Zone 1 Z: #<_rc_zone_one_z>)
#<_rc_zone_two_z> = ${config.zoneTwoZ}
(debug, Tool Recognition Zone 2 Z: #<_rc_zone_two_z>)

; Tool Measurement
; Tool measurement mode: 0 = Disabled, 1 = Enabled
#<_rc_measure> = ${config.measureEnabled ? 1 : 0}
(debug, Tool Measure Enabled: #<_rc_measure>)

`;

    if (config.measureEnabled) {
        content += `; X and Y machine coordinate positions of the tool setter.
#<_rc_measure_x> = ${config.measureX}
(debug, Tool Measure X: #<_rc_measure_x>)
#<_rc_measure_y> = ${config.measureY}
(debug, Tool Measure Y: #<_rc_measure_y>)

; Z machine coordinate position at which to begin the initial probe.
#<_rc_measure_start_z> = ${config.measureStartZ}
(debug, Tool Measure Start Z: #<_rc_measure_start_z>)

; The distance to probe in search of the tool setter for the initial probe.
#<_rc_seek_dist> = ${config.seekDistance}
(debug, Tool Measure Seek Distance: #<_rc_seek_dist>)

; The distance to retract after the initial probe trigger.
#<_rc_retract_dist> = ${config.retractDistance}

(debug, Tool Measure Retract Distance: #<_rc_retract_dist>)

; The feed rate for the initial probe.
#<_rc_seek_feed> = ${config.seekFeed}
(debug, Tool Measure Seek Feed Rate: #<_rc_seek_feed>)

; The feed rate for the second probe.
#<_rc_set_feed> = ${config.setFeed}
(debug, Tool Measure Set Feed Rate: #<_rc_set_feed>)

; The optional reference position for TLO. This may remain at it's default of 0 or be customized.
#<_rc_tlo_ref> = ${config.tloRef}
(debug, Tool Measure TLO Ref Pos: #<_rc_tlo_ref>)
`;
    }

    content += `; ********* END USER CONFIGURATION *********

; ******** BEGIN CALCULATED SETTINGS *********
; ******** DO NOT ALTER THIS SECTION *********
; Set static offsets
; These calculated offsets are consumed by RapidChange macros.
o100 if [#<_rc_units> EQ 20]
  #<_rc_z_spin_off> = 0.91
  #<_rc_z_retreat_off> = 0.47
  #<_rc_set_distance> = [#<_rc_retract_dist> + 0.04]
  (debug, Static offsets set for inches)
o100 else
  #<_rc_z_spin_off> = 23
  #<_rc_z_retreat_off> = 12
  #<_rc_set_distance> = [#<_rc_retract_dist> + 1]
  (debug, Static offsets set for millimeters)
o100 endif


; The flag indicating that the settings have been loaded into memory.
#1001 = 1
(debug, Flag Set: #1001)
(debug, RapidChange ATC Configuration Loaded)
; ******** END CALCULATED SETTINGS ***********`;

    return content;
}

function generateGrblHALToolChange() {
    return `; ************ BEGIN VALIDATION ************
o50 if [#1001 NE 1]
  (debug, RapidChange settings are not initialized.)
  (debug, Abort operation and initialize RapidChange settings.)
  (debug, Program has been paused with M0.)
  M0
  M99
o50 endif

o100 if [#<_selected_tool> LT 0]
  (debug, Selected Tool: #<_selected_tool> is out of range. Tool change aborted. Program paused.)
  M0
  M99
o100 elseif [#<_selected_tool> EQ #<_current_tool>]
  (debug, Current tool selected. Tool change bypassed.)
  M99
o100 endif
(debug, Tool change validated)
; ************* END VALIDATION *************

; ************** BEGIN SETUP ***************
; Turn off spindle and coolant
M5
M9
(debug, Spindle and coolant turned off)

; Record current units
o200 if [#<_metric> EQ 0]
  #<_rc_return_units> = 20
o200 else
  #<_rc_return_units> = 21
o200 endif
(debug, Units recorded)

; Activate configured units and absolute distance mode
G[#<_rc_units>] G90
(debug, Set units and distance)

; Magazine determination logic for ${config.magazineCount} magazines
${generateGrblHALMagazineDeterminationLogic()}

G53 G0 Z[#<_rc_safe_z>]
(debug, Moved to safe clearance)

; Open the dust cover if enabled.
o500 if [#<_rc_cover_mode> EQ 1]
  ; Axis Mode: move along the configured axis to the open position.
  o510 if [#<_rc_cover_axis> EQ 3]
    G53 G0 A[#<_rc_cover_o_pos>]
  o510 elseif [#<_rc_cover_axis> EQ 4]
    G53 G0 B[#<_rc_cover_o_pos>]
  o510 elseif [#<_rc_cover_axis> EQ 5]
    G53 G0 C[#<_rc_cover_o_pos>]
  o510 endif
o500 elseif [#<_rc_cover_mode> EQ 2]
  ; Output Mode: Turn on the output and dwell
  G4 P0
  M64 P[#<_rc_cover_output>]
  G4 P[#<_rc_cover_dwell>]
o500 endif
; *************** END SETUP ****************

; ************** BEGIN UNLOAD **************
; Unload current tool
o300 if [#<_current_tool> EQ 0]
  ; We have tool 0. Do nothing as we are already unloaded.
  (debug, Unloaded tool 0)
  M99
o300 elseif [#<_current_tool> EQ 98]
  ; We have tool 98, same as tool 0. Do nothing as we are already unloaded.
  (debug, Unloaded tool 0)
  M99
o300 elseif [#<_current_tool> GT ${generateTotalPockets()}]
  ; Tool out of magazine range. Unload manually
  G53 G0 X[#<_rc_manual_x>] Y[#<_rc_manual_y>]
  (debug, Tool #<_current_tool> is out of magazine range. Manually remove tool #<_current_tool> and cycle start to continue.)
  M0
  (debug, Unloaded tool out of range)
o300 else
  ; We have a tool with a pocket
  G53 G0 X[#<_rc_x_unload>] Y[#<_rc_y_unload>]
  (debug, Move to pocket #<_current_tool>)
  G53 G0 Z[#<_rc_engage_z> + #<_rc_z_spin_off>]
  (debug, Move to spin start)
  M4 S[#<_rc_unload_rpm>]
  (debug, Run spindle CCW)
  G53 G1 Z[#<_rc_engage_z>] F[#<_rc_engage_feed>]
  (debug, Engage)
  G53 G1 Z[#<_rc_engage_z> + #<_rc_z_retreat_off>] F[#<_rc_engage_feed>]
  (debug, Retreat)
  
  ; Confirm tool unloaded
  o310 if [#<_rc_recognize> EQ 1]
    G53 G0 Z[#<_rc_zone_one_z>]
    (debug, Move to zone 1)
    G4 P0
    M66 P[#<_rc_rec_input>] L3 Q0.2
    (debug, Read input: #5399)

    o320 if [#5399 EQ -1]
      (debug, Input read timed out)
      G53 G0 Z[#<_rc_engage_z> + #<_rc_z_spin_off>]
      (debug, Go to spindle start)
      G53 G1 Z[#<_rc_engage_z>] F[#<_rc_engage_feed>]
      (debug, Engage)
      G53 G1 Z[#<_rc_engage_z> + #<_rc_z_retreat_off>] F[#<_rc_engage_feed>]
      (debug, Retreat)
      M5
      G53 G0 Z[#<_rc_zone_one_z>]
      (debug, Move to zone 1)
      G4 P0
      M66 P[#<_rc_rec_input>] L3 Q0.2
      (debug, Input read again: #5399)
      o330 if [#5399 EQ -1]
        (debug, Input read timed out again)
        G53 G0 Z[#<_rc_safe_z>]
        (debug, Go to safe clearance)
        G53 G0 X[#<_rc_manual_x>] Y[#<_rc_manual_y>]
        (debug, Go to manual position)
        (debug, Tool #<_current_tool> failed to unload. Please manually unload tool #<_current_tool> and cycle start to continue.)
        M0
      o330 else
        G53 G0 Z[#<_rc_to_load_z>]
        (debug, Go to move to load)
      o330 endif
    o320 else
      M5
      G53 G0 Z[#<_rc_to_load_z>]
      (debug, Go to move to load)
    o320 endif
  o310 else
    M5
    (debug, Stop spindle)
    G53 G0 Z[#<_rc_to_load_z>]
    (debug, Go to move to load)
    (debug, Confirm tool #<_current_tool> is unloaded and press cycle start to continue.)
    M0
  o310 endif 
o300 endif
; *************** END UNLOAD ***************

; *************** BEGIN LOAD ***************
o400 if [#<_selected_tool> EQ 98]
  ; We selected tool 98, symbol for tool 0.
  ; Go to safe z.
  G53 G0 Z[#<_rc_safe_z>]
  ; Tool out of magazine range. Load manually
  (debug, Moved to safe clearance)
  G53 G0 X[#<_rc_manual_x>] Y[#<_rc_manual_y>]
  (debug, Tool #<_selected_tool> is out of magazine range. Manually load tool #<_selected_tool> and cycle start to continue.)
  M0
  (debug, Loaded tool out of range)
o400 elseif [#<_selected_tool> LE ${generateTotalPockets()}]
  ; We have a tool with a pocket
  ; If selected tool is in a different magazine, go to Safe Z first
  o401 if [#<_selected_magazine> EQ #<_current_magazine>]
    G53 G0 X[#<_rc_x_load>] Y[#<_rc_y_load>]
  o401 else
    G53 G0 Z[#<_rc_safe_z>]
    G53 G0 X[#<_rc_x_load>] Y[#<_rc_y_load>]
  o401 endif
  (debug, Move to pocket #<_selected_tool>)
  G53 G0 Z[#<_rc_engage_z> + #<_rc_z_spin_off>]
  (debug, Move to spin start)
  G53 G1 Z[#<_rc_load_spin_z>] F[#<_rc_engage_feed>]
  M3 S[#<_rc_load_rpm>]
  (debug, Run spindle CW)

  #<_rc_times_plunged> = 0
  o410 while [#<_rc_times_plunged> LT #<_rc_plunge_count>]
    G53 G1 Z[#<_rc_engage_z>] F[#<_rc_engage_feed>]
    (debug, Engage)
    G53 G1 Z[#<_rc_engage_z> + #<_rc_z_retreat_off>] F[#<_rc_engage_feed>]
    (debug, Retreat)
    #<_rc_times_plunged> = [#<_rc_times_plunged> + 1]
    (debug, Load plunge #<_rc_times_plunged> complete)
  o410 endwhile

  M5
  (debug, Stop spindle)

  ; Confirm Load
  o420 if [#<_rc_recognize> EQ 1]
    (debug, Tool Recognition Enabled)
    G53 G0 Z[#<_rc_zone_one_z>]
    (debug, Move to zone 1)
    G4 P0
    M66 P[#<_rc_rec_input>] L3 Q0.2
    (debug, Read input: #5399)

    o430 if [#5399 NE -1]
      (debug, Failed Zone 1)
      G53 G0 Z[#<_rc_safe_z>]
      (debug, Moved to safe clearance)
      G53 G0 X[#<_rc_manual_x>] Y[#<_rc_manual_y>]
      (debug, Tool #<_selected_tool> failed to load zone 1. Manually load tool #<_selected_tool> and cycle start to continue.)
      M0
      (debug, Manually loaded tool after failure)
    o430 else
      (debug, Passed Zone 1)
      G53 G0 Z[#<_rc_zone_two_z>]
      (debug, Move to zone 2)
      G4 P0
      M66 P[#<_rc_rec_input>] L3 Q0.2
      (debug, Read input: #5399)
      o440 if [#5399 EQ -1]
        G53 G0 Z[#<_rc_safe_z>]
        (debug, Moved to safe clearance)
        G53 G0 X[#<_rc_manual_x>] Y[#<_rc_manual_y>]
        (debug, Tool #<_selected_tool> failed to load Zone 2. Manually load tool #<_selected_tool> and cycle start to continue.)
        M0
        (debug, Manually loaded tool after failure)
      o440 else
        G53 G0 Z[#<_rc_to_measure_z>]
        (debug, Move to measure z)
      o440 endif
    o430 endif
  o420 else
    (debug, Tool recognition disabled)
    G53 G0 Z[#<_rc_to_measure_z>]
    (debug, Move to measure z)
    (debug, Confirm tool #<_selected_tool> is loaded and press cycle start to continue.)
    M0
  o420 endif
o400 else
  ; Tool out of magazine range. Load manually
  G53 G0 X[#<_rc_manual_x>] Y[#<_rc_manual_y>]
  (debug, Tool #<_selected_tool> is out of magazine range. Manually load tool #<_selected_tool> and cycle start to continue.)
  M0
  (debug, Loaded tool out of range)
o400 endif

; Update the current tool.
M61 Q[#<_selected_tool>]
G4 P0
(debug, Loaded tool #<_current_tool>)
; *************** END LOAD *****************

; ************* BEGIN MEASURE **************
o600 if [#<_current_tool> EQ 98]
  ; We selected tool 98, same as tool 0. Do nothing.
o600 elseif [#<_rc_measure> EQ 1]
  ; Tool measure is enabled and we have a tool.
  ; Remove any G43.1 Z offset
  G43.1 Z0
  (debug, G43.1 Z offset removed)
  o610 if [#5220 EQ 1]
    #<_rc_z_offset> = [#5213 + #5223]
    (debug, Z Offset Calculated in G54: #<_rc_z_offset>)
  o610 elseif [#5220 EQ 2]
    #<_rc_z_offset> = [#5213 + #5243]
    (debug, Z Offset Calculated in G55: #<_rc_z_offset>)
  o610 elseif [#5220 EQ 3]
    #<_rc_z_offset> = [#5213 + #5263]
    (debug, Z Offset Calculated in G56: #<_rc_z_offset>)
  o610 elseif [#5220 EQ 4]
    #<_rc_z_offset> = [#5213 + #5283]
    (debug, Z Offset Calculated in G57: #<_rc_z_offset>)
  o610 elseif [#5220 EQ 5]
    #<_rc_z_offset> = [#5213 + #5303]
    (debug, Z Offset Calculated in G58: #<_rc_z_offset>)
  o610 elseif [#5220 EQ 6]
    #<_rc_z_offset> = [#5213 + #5323]
    (debug, Z Offset Calculated in G59: #<_rc_z_offset>)
  o610 elseif [#5220 EQ 7]
    #<_rc_z_offset> = [#5213 + #5343]
    (debug, Z Offset Calculated in G59.1: #<_rc_z_offset>)
  o610 elseif [#5220 EQ 8]
    #<_rc_z_offset> = [#5213 + #5363]
    (debug, Z Offset Calculated in G59.2: #<_rc_z_offset>)
  o610 elseif [#5220 EQ 9]
    #<_rc_z_offset> = [#5213 + #5383]
    (debug, Z Offset Calculated in G59.3: #<_rc_z_offset>)
  o610 endif

  G53 G90 G0 Z[#<_rc_safe_z>]
  (debug, Move to Z safe)
  G53 G0 X[#<_rc_measure_x>] Y[#<_rc_measure_y>]
  (debug, Move to tool setter XY)
  G53 G0 Z[#<_rc_measure_start_z>]
  (debug, Down to Z seek start)
  G38.2 G91 Z[#<_rc_seek_dist> * -1] F[#<_rc_seek_feed>]
  (debug, Probe Z down seek mode)
  G0 G91 Z[#<_rc_retract_dist>]
  (debug, Retract from tool setter)
  G38.2 G91 Z[#<_rc_set_distance> * -1]
  (debug, Probe Z down set mode)
  G53 G0 G90 Z[#<_rc_safe_z>]
  (debug, Triggered Work Z: #5063)

  #<_rc_trigger_mach_z> = [#5063 + #<_rc_z_offset>]
  (debug, Triggered Mach Z: #<_rc_trigger_mach_z>)
  G4 P0

  o620 if [#<_rc_tlo_ref> EQ 0]
    (debug, Ref Mach Pos: 0, Work Z before G43.1: #<_z>)
    G43.1 Z[#<_rc_trigger_mach_z>]
    (debug, Ref Mach Pos: 0, Work Z after G43.1: #<_z>)
  o620 else
    (debug, Ref Mach Pos: #<_rc_tlo_ref>, Work Z before G43.1: #<_z>)
    G43.1 Z[#<_rc_tlo_ref> - #<_rc_trigger_mach_z>]
    (debug, Ref Mach Pos: #<_rc_tlo_ref>, Work Z after G43.1: #<_z>)
  o620 endif
  $TLR
  (debug, TLR set)
o600 else
  ; Tool measure is disabled
  (debug, Tool measurement disabled)
  G53 G0 Z[#<_rc_safe_z>]
  (debug, Moved to safe clearance)
o600 endif
; ************* END MEASURE ****************

; ************ BEGIN TEARDOWN **************
; Close the dust cover if enabled.
o550 if [#<_rc_cover_mode> EQ 1]
  ; Axis Mode: move along the configured axis to the close position.
  o560 if [#<_rc_cover_axis> EQ 3]
    G53 G0 A[#<_rc_cover_c_pos>]
  o560 elseif [#<_rc_cover_axis> EQ 4]
    G53 G0 B[#<_rc_cover_c_pos>]
  o560 elseif [#<_rc_cover_axis> EQ 5]
    G53 G0 C[#<_rc_cover_c_pos>]
  o560 endif
o550 elseif [#<_rc_cover_mode> EQ 2]
  ; Output Mode: Turn off the output and dwell
  G4 P0
  M65 P[#<_rc_cover_output>]
  G4 P[#<_rc_cover_dwell>]
  (debug, Dwell for cover)
o550 endif

; Restore units
G[#<_rc_return_units>]
(debug, Units restored)
(debug, Tool change complete)
; ************* END TEARDOWN ***************`;
}

function generateGrblHALDustCoverOpen() {
    return `; Validate
o50 if [#1001 NE 1]
  (debug, RapidChange settings are not initialized.)
  M99
o50 endif

o60 if [#<_rc_cover_mode> EQ 0]
  (debug, Dust cover disabled.)
o60 endif
(debug, Dust cover open validated)

; Record current units
o200 if [#<_metric> EQ 0]
  #<_rc_return_units> = 20
o200 else
  #<_rc_return_units> = 21
o200 endif
(debug, Units recorded)

; Open the dust cover if enabled.
; This can be removed if the tool setter is not in the magazine.
o500 if [#<_rc_cover_mode> EQ 1]
  ; Axis Mode: move along the configured axis to the open position.
  G[#<_rc_units>] G90
  o510 if [#<_rc_cover_axis> EQ 3]
    G53 G0 A[#<_rc_cover_o_pos>]
  o510 elseif [#<_rc_cover_axis> EQ 4]
    G53 G0 B[#<_rc_cover_o_pos>]
  o510 elseif [#<_rc_cover_axis> EQ 5]
    G53 G0 C[#<_rc_cover_o_pos>]
  o510 endif
  G[#<_rc_return_units>]
o500 elseif [#<_rc_cover_mode> EQ 2]
  ; Output Mode: Turn on the output and dwell
  G4 P0
  M64 P[#<_rc_cover_output>]
  G4 P[#<_rc_cover_dwell>]
o500 endif
(debug, Dust cover open)`;
}

function generateGrblHALDustCoverClose() {
    return `; Validate
o50 if [#1001 NE 1]
  (debug, RapidChange settings are not initialized.)
  M99
o50 endif

o60 if [#<_rc_cover_mode> EQ 0]
  (debug, Dust cover disabled.)
o60 endif
(debug, Dust cover close validated)

; Record current units
o200 if [#<_metric> EQ 0]
  #<_rc_return_units> = 20
o200 else
  #<_rc_return_units> = 21
o200 endif
(debug, Units recorded)

; Open the dust cover if enabled.
; This can be removed if the tool setter is not in the magazine.
o550 if [#<_rc_cover_mode> EQ 1]
  ; Axis Mode: move along the configured axis to the open position.
  G[#<_rc_units>] G90
  o560 if [#<_rc_cover_axis> EQ 3]
    G53 G0 A[#<_rc_cover_c_pos>]
  o560 elseif [#<_rc_cover_axis> EQ 4]
    G53 G0 B[#<_rc_cover_c_pos>]
  o560 elseif [#<_rc_cover_axis> EQ 5]
    G53 G0 C[#<_rc_cover_c_pos>]
  o560 endif
  G[#<_rc_return_units>]
o550 elseif [#<_rc_cover_mode> EQ 2]
  ; Output Mode: Turn on the output and dwell
  G4 P0
  M65 P[#<_rc_cover_output>]
  G4 P[#<_rc_cover_dwell>]
  (debug, Dwell for cover)
o550 endif
(debug, Dust cover closed)`;
}

function generateGrblHALToolMeasure() {
    return `; ************ BEGIN VALIDATION ************
o50 if [#1001 NE 1]
  (debug, RapidChange settings are not initialized. Tool measure aborted.)
  M99
o50 endif

o100 if [#<_current_tool> EQ 98]
  (debug, No current tool. Tool measure aborted.)
  M99
o100 elseif [#<_current_tool> EQ 0]
  ; Handle actual tool 0.
  (debug, No current tool. Tool measure aborted.)
  M99
o100 endif
(debug, Tool measure validated)
; ************* END VALIDATION *************

; ************** BEGIN SETUP ***************
; Turn off spindle and coolant
M5
M9
(debug, Spindle and coolant turned off)

; [Complete tool measurement logic would be here]
; ************* END MEASURE ****************`;
}

function displayMacros(macroFiles) {
    const container = document.getElementById('macro-files');
    container.innerHTML = '';
    
    macroFiles.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'macro-file fade-in';
        
        fileDiv.innerHTML = `
            <div class="file-header">
                <span>${file.filename}</span>
                <button class="btn-download" onclick="downloadFile('${file.filename}', \`${file.content.replace(/`/g, '\\`')}\`)">
                    Download
                </button>
            </div>
            <div class="file-content">${escapeHtml(file.content)}</div>
        `;
        
        container.appendChild(fileDiv);
    });
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function previewConfiguration() {
    loadConfiguration();
    
    let preview = `Configuration Preview:\n\n`;
    preview += `Firmware: ${config.firmware.toUpperCase()}\n`;
    preview += `Number of Magazines: ${config.magazineCount}\n`;
    preview += `Units: ${config.units === 20 ? 'Inches' : 'Millimeters'}\n\n`;
    
    config.magazines.forEach((mag, index) => {
        preview += `Magazine ${index + 1}:\n`;
        preview += `  Pockets: ${mag.pockets}\n`;
        preview += `  Pocket Offset: ${mag.pocketOffset}\n`;
        preview += `  Alignment: ${mag.alignment === 0 ? 'X Axis' : 'Y Axis'}\n`;
        preview += `  Direction: ${mag.direction === 1 ? 'Positive' : 'Negative'}\n`;
        preview += `  Pocket 1 Position: X${mag.pocketOneX}, Y${mag.pocketOneY}\n\n`;
    });
    
    preview += `Tool Measurement: ${config.measureEnabled ? 'Enabled' : 'Disabled'}\n`;
    if (config.measureEnabled) {
        preview += `  Tool Setter Position: X${config.measureX}, Y${config.measureY}\n`;
    }
    
    alert(preview);
}

function setupTooltips() {
    const tooltip = document.getElementById('tooltip');
    
    document.querySelectorAll('.tooltip').forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const text = e.target.dataset.tooltip;
            tooltip.textContent = text;
            tooltip.style.display = 'block';
            
            const rect = e.target.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
        });
        
        element.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    });
}

function getOrdinal(num) {
    if (num % 100 >= 11 && num % 100 <= 13) {
        return `${num}th`;
    }
    switch (num % 10) {
        case 1: return `${num}st`;
        case 2: return `${num}nd`;
        case 3: return `${num}rd`;
        default: return `${num}th`;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}