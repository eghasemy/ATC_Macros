; ******** BEGIN USER CONFIGURATION ********
; ATC Operations
; The units for your configuration: 20 = Inches, 21 = Millimeters
#<_rc_units> = 21
(print,Units: #<_rc_units>)

; The number of pockets in your 1st magazine.
#<_rc1_pockets> = 4
(print,Pockets: #<_rc1_pockets>)

; The number of pockets in your 2nd magazine.
#<_rc2_pockets> = 4
(print,Pockets: #<_rc2_pockets>)

; The number of pockets in your 3rd magazine.
#<_rc3_pockets> = 4
(print,Pockets: #<_rc3_pockets>)

; The number of pockets in your 4th magazine.
#<_rc4_pockets> = 4
(print,Pockets: #<_rc4_pockets>)

; The pocket offset for your magazines.
#<_rc_pocket_offset> = 35
(print,Pocket Offset: #<_rc_pocket_offset>)

; The axis along which the 1st magazine is aligned: 0 = X Axis, 1 = Y Axis.
#<_rc1_alignment> = 0
(print,Alignment: #<_rc1_alignment>)

; The axis along which the 2nd magazine is aligned: 0 = X Axis, 1 = Y Axis.
#<_rc2_alignment> = 0
(print,Alignment: #<_rc2_alignment>)

; The axis along which the 3rd magazine is aligned: 0 = X Axis, 1 = Y Axis.
#<_rc3_alignment> = 0
(print,Alignment: #<_rc3_alignment>)

; The axis along which the 4th magazine is aligned: 0 = X Axis, 1 = Y Axis.
#<_rc4_alignment> = 0
(print,Alignment: #<_rc4_alignment>)

; The direction of travel from pocket 1 to pocket 2 for the 1st magazine: 1 = Positive, -1 = Negative.
#<_rc1_direction> = 1
(print,Direction: #<_rc1_direction>)

; The direction of travel from pocket 1 to pocket 2 for the 2nd magazine: 1 = Positive, -1 = Negative.
#<_rc2_direction> = 1
(print,Direction: #<_rc2_direction>)

; The direction of travel from pocket 1 to pocket 2 for the 3rd magazine: 1 = Positive, -1 = Negative.
#<_rc3_direction> = 1
(print,Direction: #<_rc3_direction>)

; The direction of travel from pocket 1 to pocket 2 for the 4th magazine: 1 = Positive, -1 = Negative.
#<_rc4_direction> = 1
(print,Direction: #<_rc4_direction>)

; The X an Y machine coordinate positions of pocket 1 of the 1st magazine.
#<_rc1_pckt_one_x> = 212.1
(print,Pocket 1 X: #<_rc1_pckt_one_x>)

#<_rc1_pckt_one_y> = 72.6
(print,Pocket 1 Y: #<_rc1_pckt_one_y>)

; The X an Y machine coordinate positions of pocket 1 of the 2nd magazine.
#<_rc2_pckt_one_x> = 369.1
(print,Pocket 1 X: #<_rc2_pckt_one_x>)

#<_rc2_pckt_one_y> = 72.6
(print,Pocket 1 Y: #<_rc2_pckt_one_y>)

; The X an Y machine coordinate positions of pocket 1 of the 3rd magazine.
#<_rc3_pckt_one_x> = 212.1
(print,Pocket 1 X: #<_rc3_pckt_one_x>)

#<_rc3_pckt_one_y> = 30.6
(print,Pocket 1 Y: #<_rc3_pckt_one_y>)

; The X an Y machine coordinate positions of pocket 1 of the 4th magazine.
#<_rc4_pckt_one_x> = 369.1
(print,Pocket 1 X: #<_rc4_pckt_one_x>)

#<_rc4_pckt_one_y> = 30.6
(print,Pocket 1 Y: #<_rc4_pckt_one_y>)

; The Z machine coordinate positon of engagement.
#<_rc_engage_z> = -141.5
(print,Engage Z: #<_rc_engage_z>)

; The Z machine coordinate position at which to start the spindle when loading.
#<_rc_load_spin_z> = -125
(print,Load Spindle Start Z: #<_rc_load_spin_z>)

; The number of times to plunge when loading.
#<_rc_plunge_count> = 2
(print,Load Plunge Count: #<_rc_plunge_count>)

; The Z machine coordinate position to rise to after unloading, before moving to load. (No Tool Loaded RV)
#<_rc_to_load_z> = -80
(print,Move To Load Z: #<_rc_to_load_z>)

; The Z machine coordinate position to rise to after loading, before moving to meeasure.
#<_rc_to_measure_z> = -80
(print,Move To Measure Z: #<_rc_to_measure_z>)

; The Z machine coordinate position for clearing all obstacles.
#<_rc_safe_z> = -80
(print,Safe Clearance Z: #<_rc_safe_z>)

; The feed rate for engagement.
#<_rc_engage_feed> = 2000
(print,Engage Feed Rate: #<_rc_engage_feed>)

; Spindle speed CCW
#<_rc_unload_rpm> = 2000
(print,Unload RPM: #<_rc_unload_rpm>)

; Spindle speed CW
#<_rc_load_rpm> = 1600
(print,Load RPM: #<_rc_load_rpm>)

; Manual Tool Change
; X and Y machine coordinates to move to for a manual load/unload.
#<_rc_manual_x> = 100
(print,Manual X: #<_rc_manual_x>)
#<_rc_manual_y> = 50
(print,Manual Y: #<_rc_manual_y>)

; Dust Cover
; The dust cover operational mode: 0 = Disabled, 1 = Axis, 2 = Output
#<_rc_cover_mode> = 0
(print,Dust Cover Mode: #<_rc_cover_mode>)

; The axis for axis mode: 3 = A Axis, 4 = B Axis, 5 = C Axis
#<_rc_cover_axis> = 0
(print,Dust Cover Axis: #<_rc_cover_axis>)

; The machine coordinate closed position for axis mode.
#<_rc_cover_c_pos> = 0
(print,Dust Cover Closed Pos: #<_rc_cover_c_pos>)

; The machine coordinate open position for axis mode.
#<_rc_cover_o_pos> = 0
(print,Dust Cover Open Pos: #<_rc_cover_o_pos>)

; The output number for output mode.
#<_rc_cover_output> = 0
(print,Dust Cover Output: #<_rc_cover_output>)

; The time to dwell in output mode to allow the cover to fully open/close before moving.
#<_rc_cover_dwell> = 1
(print,Dust Cover Dwell: #<_rc_cover_dwell>)

; Tool Recognition
; Tool recognition mode: 0 = Disabled-User confirmation only, 1 = Enabled
#<_rc_recognize> = 0
(print,Tool Recognition Enabled: #<_rc_recognize>)

; IR sensor input number.
#<_rc_rec_input> = 0
(print,Tool Recognition Input: #<_rc_rec_input>)

; Z Machine coordinate positions tool recognition.
#<_rc_zone_one_z> = -63.500
(print,Tool Recognition Zone 1 Z: #<_rc_zone_one_z>)
#<_rc_zone_two_z> =-57.0
(print,Tool Recognition Zone 2 Z: #<_rc_zone_two_z>)

; Tool Measurement
; Tool measurement mode: 0 = Disabled, 1 = Enabled
#<_rc_measure> = 1
(print,Tool Measure Enabled: #<_rc_measure>)

; X and Y machine coordinate positions of the tool setter.
#<_rc_measure_x> = 1184.7
(print,Tool Measure X: #<_rc_measure_x>)
#<_rc_measure_y> = 74.7
(print,Tool Measure Y: #<_rc_measure_y>)

; Z machine coordinate position at which to begin the initial probe.
#<_rc_measure_start_z> = -80
(print,Tool Measure Start Z: #<_rc_measure_start_z>)

; The distance to probe in search of the tool setter for the initial probe.
#<_rc_seek_dist> = 150
(print,Tool Measure Seek Distance: #<_rc_seek_dist>)

; The distance to retract after the initial probe trigger.
#<_rc_retract_dist> = 1

(print,Tool Measure Retract Distance: #<_rc_retract_dist>)

; The feed rate for the initial probe.
#<_rc_seek_feed> = 500
(print,Tool Measure Seek Feed Rate: #<_rc_seek_feed>)

; The feed rate for the second probe.
#<_rc_set_feed> = 25
(print,Tool Measure Set Feed Rate: #<_rc_set_feed>)

; The optional reference position for TLO. This may remain at it's default of 0 or be customized.
#<_rc_tlo_ref> = 0
(print,Tool Measure TLO Ref Pos: #<_rc_tlo_ref>)
; ********* END USER CONFIGURATION *********

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
G43.1 Z0