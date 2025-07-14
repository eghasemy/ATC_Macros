; 
; Copyright (C) 2024 Greilick Industries LLC

; RapidChange ATC Macros for GrblHAL is free software:
; You can redistribute it and/or modify it under the terms
; of the GNU General Public License as published by
; the Free Software Foundation, under version 3 of the License.

; RapidChange ATC Macros for GrblHAL is distributed in the
; hope that it will be useful, but WITHOUT ANY WARRANTY
; without even the implied warranty of MERCHANTABILITY or
; FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
; License for more details.

; You should have received a copy of the GNU General Public License
; along with RapidChange ATC Macros for GrblHAL.  
; If not, see <https://www.gnu.org/licenses/>.
;

; ************ BEGIN VALIDATION ************
o50 if [#1001 NE 1]
  (print, RapidChange settings are not initialized.)
  (print, Abort operation and initialize RapidChange settings.)
  (print, Program has been paused with M0.)
  M0
  M99
o50 endif

o100 if [#<_selected_tool> LT 0]
  (print, Selected Tool: #<_selected_tool> is out of range. Tool change aborted. Program paused.)
  M0
  M99
o100 elseif [#<_selected_tool> EQ #<_current_tool>]
  (print, Current tool selected. Tool change bypassed.)
  M99
o100 endif
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

; Determine current magazine based on current tool number
o205 if [#<_current_tool> LE #<_rc1_pockets>]
  #<_current_magazine> = 1 ; Primary magazine (rc1)
  (print, Current tool in primary magazine)
o205 else
  #<_current_magazine> = 2 ; Secondary magazine (rc2)
  (print, Current tool in secondary magazine)
o205 endif

; Determine selected magazine based on selected tool number
o206 if [#<_selected_tool> LE #<_rc1_pockets>]
  #<_selected_magazine> = 1 ; Primary magazine (rc1)
  (print, Selected tool in primary magazine)
o206 else
  #<_selected_magazine> = 2 ; Secondary magazine (rc2)
  (print, Selected tool in secondary magazine)
o206 endif

o207 if [#<_current_tool> EQ 98]
  M99
o207 else
  ; Set pocket locations based on selected and current magazines
  o210 if [#<_current_magazine> EQ 1]  ; Primary magazine setup
    o211 if [#<_rc1_alignment> EQ 0]
      #<_rc_x_unload> = [[[#<_current_tool> - 1] * #<_rc1_pocket_offset> * #<_rc1_direction>] + #<_rc1_pocket_one_x>]
      (print, Unload X set to #<_rc_x_unload> for primary magazine)
      #<_rc_y_unload> = #<_rc1_pocket_one_y>
      (print, Unload Y set to #<_rc_y_unload> for primary magazine)
    o211 else
      #<_rc_x_unload> = #<_rc1_pocket_one_x>
      (print, Unload X set to #<_rc_x_unload> for primary magazine)
      #<_rc_y_unload> = [[[#<_current_tool> - 1] * #<_rc1_pocket_offset> * #<_rc1_direction>] + #<_rc1_pocket_one_y>]
      (print, Unload Y set to #<_rc_y_unload> for primary magazine, Y alignment)
    o211 endif
  o210 else  ; Secondary magazine setup
    o212 if [#<_rc2_alignment> EQ 0]
      #<_temp1> = [#<_rc1_pockets> + 1]
      #<_temp2> = [#<_current_tool> - #<_temp1>]
      #<_temp3> = [#<_temp2> * #<_rc2_pocket_offset>]
      #<_temp4> = [#<_temp3> * #<_rc2_direction>]
      #<_rc_y_unload> = [#<_temp4> + #<_rc2_pocket_one_x>]
      ;#<_rc_x_unload> = [[[#<_current_tool> - #<_temp1>] * #<_rc2_pocket_offset> * #<_rc2_direction>] + #<_rc2_pocket_one_x>]
      (print, Unload X set to #<_rc_x_unload> for secondary magazine)
      #<_rc_y_unload> = #<_rc2_pocket_one_y>
      (print, Unload Y set to #<_rc_y_unload> for secondary magazine)
    o212 else
      #<_rc_x_unload> = #<_rc2_pocket_one_x>
      (print, Unload X set to #<_rc_x_unload> for secondary magazine)
      #<_temp1> = [#<_rc1_pockets> + 1]
      #<_temp2> = [#<_current_tool> - #<_temp1>]
      #<_temp3> = [#<_temp2> * #<_rc2_pocket_offset>]
      #<_temp4> = [#<_temp3> * #<_rc2_direction>]
      #<_rc_y_unload> = [#<_temp4> + #<_rc2_pocket_one_y>]
      ;#<_rc_y_unload> = [[[#<_current_tool> - #<_temp1>] * #<_rc2_pocket_offset> * #<_rc2_direction>] + #<_rc2_pocket_one_y>]
      (print, Unload Y set to #<_rc_y_unload> for secondary magazine, Y alignment)
    o212 endif
  o210 endif
o207 endif

; Load settings based on selected magazine
o213 if [#<_selected_magazine> EQ 1]  ; Primary magazine setup
  o214 if [#<_rc1_alignment> EQ 0]
    (print, Load X set to #<_rc_x_load> for primary magazine)
    #<_rc_x_load> = [[[#<_selected_tool> - 1] * #<_rc1_pocket_offset> * #<_rc1_direction>] + #<_rc1_pocket_one_x>]
    (print, Load X set to #<_rc_x_load> for primary magazine)
    #<_rc_y_load> = #<_rc1_pocket_one_y>
    (print, Load Y set to #<_rc_y_load> for primary magazine)
  o214 else
    #<_rc_x_load> = #<_rc1_pocket_one_x>
    (print, Load X set to #<_rc_x_load> for primary magazine)
    #<_rc_y_load> = [[[#<_selected_tool> - 1] * #<_rc1_pocket_offset> * #<_rc1_direction>] + #<_rc1_pocket_one_y>]
    (print, Load Y set to #<_rc_y_load> for primary magazine, Y alignment)
  o214 endif
o213 else  ; Secondary magazine setup
  o215 if [#<_rc2_alignment> EQ 0]
    #<_temp1> = [#<_rc1_pockets> + 1]
    #<_temp2> = [#<_selected_tool> - #<_temp1>]
    #<_temp3> = [#<_temp2> * #<_rc2_pocket_offset>]
    #<_temp4> = [#<_temp3> * #<_rc2_direction>]
    #<_rc_y_load> = [#<_temp4> + #<_rc2_pocket_one_x>]
    ;#<_rc_x_load> = [[[#<_selected_tool> - #<_temp1>] * #<_rc2_pocket_offset> * #<_rc2_direction>] + #<_rc2_pocket_one_x>]
    (print, Load X set to #<_rc_x_load> for secondary magazine)
    #<_rc_y_load> = #<_rc2_pocket_one_y>
    (print, Load Y set to #<_rc_y_load> for secondary magazine)
  o215 else
    #<_rc_x_load> = #<_rc2_pocket_one_x>
    (print, _selected_tool set to #<_selected_tool> for secondary magazine)
    #<_temp1> = [#<_rc1_pockets> + 1]
    #<_temp2> = [#<_selected_tool> - #<_temp1>]
    #<_temp3> = [#<_temp2> * #<_rc2_pocket_offset>]
    #<_temp4> = [#<_temp3> * #<_rc2_direction>]
    #<_rc_y_load> = [#<_temp4> + #<_rc2_pocket_one_y>]
    ;#<_rc_y_load> = [[[#<_selected_tool> - #<_temp1>] * #<_rc2_pocket_offset> * #<_rc2_direction>] + #<_rc2_pocket_one_y>]
    (print, Load Y set to #<_rc_y_load> for secondary magazine, Y alignment)
  o215 endif
o213 endif


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
  G4 P0
  M64 P[#<_rc_cover_output>]
  G4 P[#<_rc_cover_dwell>]
o500 endif
; *************** END SETUP ****************

; ************** BEGIN UNLOAD **************
; Unload current tool
o300 if [#<_current_tool> EQ 0]
  ; We have tool 0. Do nothing as we are already unloaded.
  (print, Unloaded tool 0)
    M99
o300 elseif [#<_current_tool> EQ 98]
  ; We have tool 98, same as tool 0. Do nothing as we are already unloaded.
  (print, Unloaded tool 0)
    M99
o300 elseif [#<_current_tool> GT [#<_rc1_pockets> + #<_rc2_pockets>]]
  ; Tool out of magazine range. Unload manually
  G53 G0 X[#<_rc_manual_x>] Y[#<_rc_manual_y>]
  (print, Tool #<_current_tool> is out of magazine range. Manually remove tool #<_current_tool> and cycle start to continue.)
  M0
  (print, Unloaded tool out of range)
o300 else
  ; We have a tool with a pocket
  G53 G0 X[#<_rc_x_unload>] Y[#<_rc_y_unload>]
  (print, Move to pocket #<_current_tool>)
  G53 G0 Z[#<_rc_engage_z> + #<_rc_z_spin_off>]
  (print, Move to spin start)
  M4 S[#<_rc_unload_rpm>]
  (print, Run spindle CCW)
  G53 G1 Z[#<_rc_engage_z>] F[#<_rc_engage_feed>]
  (print, Engage)
  G53 G1 Z[#<_rc_engage_z> + #<_rc_z_retreat_off>] F[#<_rc_engage_feed>]
  (print, Retreat)
o300 endif
; *************** END UNLOAD ***************

; *************** BEGIN LOAD ***************
o400 if [#<_selected_tool> EQ 98]
  ; We selected tool 98, symbol for tool 0.
  ; Go to safe z.
  G53 G0 Z[#<_rc_safe_z>]
  ; Tool out of magazine range. Load manually
  (print, Moved to safe clearance)
  G53 G0 X[#<_rc_manual_x>] Y[#<_rc_manual_y>]
  (print, Tool #<_selected_tool> is out of magazine range. Manually load tool #<_selected_tool> and cycle start to continue.)
  M0
  (print, Loaded tool out of range)
o400 elseif [#<_selected_tool> LE [#<_rc1_pockets> + #<_rc2_pockets>]]
  ; We have a tool with a pocket
  ; If selected tool is in a different magazine, go to Safe Z first
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

  #<_rc_times_plunged> = 0
  o410 while [#<_rc_times_plunged> LT #<_rc_plunge_count>]
    G53 G1 Z[#<_rc_engage_z>] F[#<_rc_engage_feed>]
    (print, Engage)
    G53 G1 Z[#<_rc_engage_z> + #<_rc_z_retreat_off>] F[#<_rc_engage_feed>]
    (print, Retreat)
    #<_rc_times_plunged> = [#<_rc_times_plunged> + 1]
    (print, Load plunge #<_rc_times_plunged> complete)
  o410 endwhile

  M5
  (print, Stop spindle)

  ; Confirm Load
  o420 if [#<_rc_recognize> EQ 1]
    (print, Tool Recognition Enabled)
    G53 G0 Z[#<_rc_zone_one_z>]
    (print, Move to zone 1)
    G4 P0
    M66 P[#<_rc_rec_input>] L3 Q0.2
    (print, Read input: #5399)

    o430 if [#5399 NE -1]
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
      G4 P0
      M66 P[#<_rc_rec_input>] L3 Q0.2
      (print, Read input: #5399)
      o440 if [#5399 EQ -1]
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
  G53 G0 X[#<_rc_manual_x>] Y[#<_rc_manual_y>]
  (print, Tool #<_selected_tool> is out of magazine range. Manually load tool #<_selected_tool> and cycle start to continue.)
  M0
  (print, Loaded tool out of range)
o400 endif

; Update the current tool.
M61 Q[#<_selected_tool>]
G4 P0
(print, Loaded tool #<_current_tool>)
; *************** END LOAD *****************

; ************* BEGIN MEASURE **************
o600 if [#<_current_tool> EQ 98]
  ; We selected tool 98, same as tool 0. Do nothing.
o600 elseif [#<_rc_measure> EQ 1]
  ; Tool measure is enabled and we have a tool.
  ; Remove any G43.1 Z offset
  G43.1 Z0
  (print, G43.1 Z offset removed)
  o610 if [#5220 EQ 1]
    #<_rc_z_offset> = [#5213 + #5223]
    (print, Z Offset Calculated in G54: #<_rc_z_offset>)
  o610 elseif [#5220 EQ 2]
    #<_rc_z_offset> = [#5213 + #5243]
    (print, Z Offset Calculated in G55: #<_rc_z_offset>)
  o610 elseif [#5220 EQ 3]
    #<_rc_z_offset> = [#5213 + #5263]
    (print, Z Offset Calculated in G56: #<_rc_z_offset>)
  o610 elseif [#5220 EQ 4]
    #<_rc_z_offset> = [#5213 + #5283]
    (print, Z Offset Calculated in G57: #<_rc_z_offset>)
  o610 elseif [#5220 EQ 5]
    #<_rc_z_offset> = [#5213 + #5303]
    (print, Z Offset Calculated in G58: #<_rc_z_offset>)
  o610 elseif [#5220 EQ 6]
    #<_rc_z_offset> = [#5213 + #5323]
    (print, Z Offset Calculated in G59: #<_rc_z_offset>)
  o610 elseif [#5220 EQ 7]
    #<_rc_z_offset> = [#5213 + #5343]
    (print, Z Offset Calculated in G59.1: #<_rc_z_offset>)
  o610 elseif [#5220 EQ 8]
    #<_rc_z_offset> = [#5213 + #5363]
    (print, Z Offset Calculated in G59.2: #<_rc_z_offset>)
  o610 elseif [#5220 EQ 9]
    #<_rc_z_offset> = [#5213 + #5383]
    (print, Z Offset Calculated in G59.3: #<_rc_z_offset>)
  o610 endif

  G53 G90 G0 Z[#<_rc_safe_z>]
  (print, Move to Z safe)
  G53 G0 X[#<_rc_measure_x>] Y[#<_rc_measure_y>]
  (print, Move to tool setter XY)
  G53 G0 Z[#<_rc_measure_start_z>]
  (print, Down to Z seek start)
  G38.2 G91 Z[#<_rc_seek_dist> * -1] F[#<_rc_seek_feed>]
  (print, Probe Z down seek mode)
  G0 G91 Z[#<_rc_retract_dist>]
  (print, Retract from tool setter)
  G38.2 G91 Z[#<_rc_set_distance> * -1]
  (print, Probe Z down set mode)
  G53 G0 G90 Z[#<_rc_safe_z>]
  (print, Triggered Work Z: #5063)

  #<_rc_trigger_mach_z> = [#5063 + #<_rc_z_offset>]
  (print, Triggered Mach Z: #<_rc_trigger_mach_z>)
  G4 P0

  o620 if [#<_rc_tlo_ref> EQ 0]
    (print, Ref Mach Pos: 0, Work Z before G43.1: #<_z>)
    G43.1 Z[#<_rc_trigger_mach_z>]
    (print, Ref Mach Pos: 0, Work Z after G43.1: #<_z>)
  o620 else
    (print, Ref Mach Pos: #<_rc_tlo_ref>, Work Z before G43.1: #<_z>)
    G43.1 Z[#<_rc_tlo_ref> - #<_rc_trigger_mach_z>]
    (print, Ref Mach Pos: #<_rc_tlo_ref>, Work Z after G43.1: #<_z>)
  o620 endif
  $TLR
  (print, TLR set)
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
  ; Axis Mode: move along the configured axis to the open position.
  o560 if [#<_rc_cover_axis> EQ 3]
    G53 G0 A[#<_rc_cover_c_pos>]
  o560 elseif [#<_rc_cover_axis> EQ 4]
    G53 G0 B[#<_rc_cover_c_pos>]
  o560 elseif [#<_rc_cover_axis> EQ 5]
    G53 G0 C[#<_rc_cover_c_pos>]
  o560 endif
o550 elseif [#<_rc_cover_mode> EQ 2]
  ; Output Mode: Turn on the output and dwell
  G4 P0
  M65 P[#<_rc_cover_output>]
  G4 P[#<_rc_cover_dwell>]
  (print, Dwell for cover)
o550 endif

; Restore units
G[#<_rc_return_units>]
(print, Units restored)
(print, Tool change complete)
; ************* END TEARDOWN ***************