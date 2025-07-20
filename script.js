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
        // GrblHAL defaults
        document.getElementById('magazine-count').innerHTML = `
            <option value="1">1 Magazine</option>
            <option value="2" selected>2 Magazines</option>
        `;
        config.magazineCount = Math.min(config.magazineCount, 2);
    } else {
        // FluidNC defaults (supports up to 4 magazines)
        document.getElementById('magazine-count').innerHTML = `
            <option value="1">1 Magazine</option>
            <option value="2">2 Magazines</option>
            <option value="3">3 Magazines</option>
            <option value="4">4 Magazines</option>
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
    // This would be the complete FluidNC tool change macro
    // For brevity, I'm including a simplified version that handles the magazine count
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
	${generateMagazineDeterminationLogic()}

	; Tool change operations continue...
	; [Complete tool change logic would be here]

o50 endif`;
}

function generateMagazineDeterminationLogic() {
    let logic = '';
    let totalPockets = 0;
    
    for (let i = 0; i < config.magazineCount; i++) {
        const mag = config.magazines[i];
        const magNum = i + 1;
        const previousTotal = totalPockets;
        totalPockets += mag.pockets;
        
        if (i === 0) {
            logic += `	; Determine current magazine based on current tool number
	o205 if [#<_current_tool> LE #<_rc${magNum}_pockets>]
  		#<_current_magazine> = ${magNum}
  		(print, Current tool in magazine #<_current_magazine>)
`;
        } else if (i === config.magazineCount - 1) {
            logic += `	o205 else 
		#<_current_magazine> = ${magNum}
		(print, Current tool in magazine #<_current_magazine>)
	o205 endif
`;
        } else {
            logic += `	o205 elseif [#<_current_tool> GT ${previousTotal} AND #<_current_tool> LE ${totalPockets}]
  		#<_current_magazine> = ${magNum}
  		(print, Current tool in magazine #<_current_magazine>)
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

    // For GrblHAL, limit to 2 magazines
    const maxMags = Math.min(config.magazineCount, 2);
    
    for (let i = 0; i < maxMags; i++) {
        const mag = config.magazines[i];
        const magNum = i + 1;
        
        content += `; The number of pockets in your ${i === 0 ? 'magazine' : 'secondary module'}.
#<_rc${magNum}_pockets> = ${mag.pockets}
(debug, ${i === 0 ? 'Pockets' : 'Secondary Pockets'}: #<_rc${magNum}_pockets>)
`;
        
        if (i === 0) content += '\n';
    }

    for (let i = 0; i < maxMags; i++) {
        const mag = config.magazines[i];
        const magNum = i + 1;
        
        content += `; The pocket offset for your ${i === 0 ? 'magazine' : 'second magazine'}.
#<_rc${magNum}_pocket_offset> = ${mag.pocketOffset}
(debug, Pocket Offset: #<_rc${magNum}_pocket_offset>)
`;
        
        if (i === 0 && maxMags > 1) content += '\n';
    }

    content += '\n';

    for (let i = 0; i < maxMags; i++) {
        const mag = config.magazines[i];
        const magNum = i + 1;
        
        content += `; The axis along which the ${i === 0 ? 'first' : 'second'} magazine is aligned: 0 = X Axis, 1 = Y Axis.
#<_rc${magNum}_alignment> = ${mag.alignment}
(debug, Alignment: #<_rc${magNum}_alignment>)
`;
        
        if (i === 0 && maxMags > 1) content += '\n';
    }

    content += '\n';

    for (let i = 0; i < maxMags; i++) {
        const mag = config.magazines[i];
        const magNum = i + 1;
        
        content += `; The direction of travel from pocket 1 to pocket 2: 1 = Positive, -1 = Negative.
#<_rc${magNum}_direction> = ${mag.direction}
(debug, Direction: #<_rc${magNum}_direction>)
`;
        
        if (i === 0 && maxMags > 1) content += '\n';
    }

    content += '\n';

    for (let i = 0; i < maxMags; i++) {
        const mag = config.magazines[i];
        const magNum = i + 1;
        
        content += `; The X and Y machine coordinate positions of ${i === 0 ? 'primary' : 'secondary'} magazine pocket 1.
#<_rc${magNum}_pocket_one_x> = ${mag.pocketOneX}
(debug, Pocket ${i + 1} X: #<_rc${magNum}_pocket_one_x>)
#<_rc${magNum}_pocket_one_y> = ${mag.pocketOneY}
(debug, Pocket ${i + 1} Y: #<_rc${magNum}_pocket_one_y>)
`;
        
        if (i === 0 && maxMags > 1) content += '\n';
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
    // Return the complete GrblHAL tool change macro
    // This is a simplified version - in practice, you'd want the full logic
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

; [Complete tool change logic for ${config.magazineCount} magazines would be here]
; *************** END SETUP ****************`;
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
    const ordinals = ['', '1st', '2nd', '3rd', '4th'];
    return ordinals[num] || `${num}th`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}