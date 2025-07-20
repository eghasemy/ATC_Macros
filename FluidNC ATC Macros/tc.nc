; ************ BEGIN VALIDATION ************
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

	; Determine selected magazine based on selected tool number
	o205 if [#<_current_tool> LE #<_rc1_pockets>]
  		#<_current_magazine> = 1
  		(print, Current tool in magazine #<_current_magazine>)
		o211 if [#<_rc1_alignment> EQ 0]
			#<_rc_x_unload> = [[[#<_current_tool> - 1] * #<_rc_pocket_offset> * #<_rc1_direction>] + #<_rc1_pckt_one_x>]
			(print, Unload X set to #<_rc_x_unload> for primary magazine)
			#<_rc_y_unload> = #<_rc1_pckt_one_y>
			(print, Unload Y set to #<_rc_y_unload> for primary magazine)
		o211 else
			#<_rc_x_unload> = #<_rc1_pckt_one_x>
			(print, Unload X set to #<_rc_x_unload> for primary magazine)
			#<_rc_y_unload> = [[[#<_current_tool> - 1] * #<_rc_pocket_offset> * #<_rc1_direction>] + #<_rc1_pckt_one_y>]
			(print, Unload Y set to #<_rc_y_unload> for primary magazine, Y alignment)
		o211 endif
	o205 elseif [#<_current_tool> GT #<_rc1_pockets> AND #<_current_tool> LE [#<_rc1_pockets> + #<_rc2_pockets>]]
  		#<_current_magazine> = 2
  		(print, Current tool in magazine #<_current_magazine>)
		(print, Unloading from magazine #<_current_magazine>)
		o212 if [#<_rc2_alignment> EQ 0]
			#<_temp1> = [#<_rc1_pockets> + 1]
			#<_temp2> = [#<_current_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc2_direction>]
			#<_rc_x_unload> = [#<_temp4> + #<_rc2_pckt_one_x>]
			(print, Unload X set to #<_rc_x_unload> for secondary magazine)
			#<_rc_y_unload> = #<_rc2_pckt_one_y>
			(print, Unload Y set to #<_rc_y_unload> for secondary magazine)
		o212 else
			#<_rc_x_unload> = #<_rc2_pckt_one_x>
			(print, Unload X set to #<_rc_x_unload> for secondary magazine)
			#<_temp1> = [#<_rc1_pockets> + 1]
			#<_temp2> = [#<_current_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc2_direction>]
			#<_rc_y_unload> = [#<_temp4> + #<_rc2_pckt_one_y>]
			(print, Unload Y set to #<_rc_y_unload> for secondary magazine, Y alignment)
		o212 endif
	o205 elseif [#<_current_tool> GT [#<_rc1_pockets> + #<_rc2_pockets>] AND [#<_current_tool> LE [#<_rc1_pockets> + #<_rc2_pockets> + #<_rc3_pockets>]]]
		#<_current_magazine> = 3
		(print, Current tool in magazine #<_current_magazine>)
		(print, Unloading from magazine #<_current_magazine>)
		o213 if [#<_rc3_alignment> EQ 0]
			#<_temp1> = [#<_rc1_pockets> + #<_rc2_pockets> + 1]
			#<_temp2> = [#<_current_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc3_direction>]
			#<_rc_x_unload> = [#<_temp4> + #<_rc3_pckt_one_x>]
			(print, Unload X set to #<_rc_x_unload> for tertiary magazine)
			#<_rc_y_unload> = #<_rc3_pckt_one_y>
			(print, Unload Y set to #<_rc_y_unload> for tertiary magazine)
		o213 else
			#<_rc_x_unload> = #<_rc3_pckt_one_x>
			(print, Unload X set to #<_rc_x_unload> for tertiary magazine)
			#<_temp1> = [#<_rc1_pockets> + #<_rc2_pockets> + 1]
			#<_temp2> = [#<_current_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc3_direction>]
			#<_rc_y_unload> = [#<_temp4> + #<_rc3_pckt_one_y>]
		o213 endif
	o205 else 
		#<_current_magazine> = 4
		(print, Current tool in magazine #<_current_magazine>)
		(print, Unloading from magazine #<_current_magazine>)
		o214 if [#<_rc4_alignment> EQ 0]
			#<_temp1> = [#<_rc1_pockets> + #<_rc2_pockets> + #<_rc3_pockets> + 1]
			#<_temp2> = [#<_current_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc4_direction>]
			#<_rc_x_unload> = [#<_temp4> + #<_rc4_pckt_one_x>]
			(print, Unload X set to #<_rc_x_unload> for quaternary magazine)
			#<_rc_y_unload> = #<_rc4_pckt_one_y>
			(print, Unload Y set to #<_rc_y_unload> for quaternary magazine)
		o214 else
			#<_rc_x_unload> = #<_rc4_pckt_one_x>
			(print, Unload X set to #<_rc_x_unload> for quaternary magazine)
			#<_temp1> = [#<_rc1_pockets> + #<_rc2_pockets> + #<_rc3_pockets> + 1]
			#<_temp2> = [#<_current_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc4_direction>]
			#<_rc_y_unload> = [#<_temp4> + #<_rc4_pckt_one_y>]
		o214 endif
	o205 endif
	
	; Determine selected magazine based on selected tool number
	o206 if [#<_selected_tool> LE #<_rc1_pockets>]
  		#<_selected_magazine> = 1 ; 1st magazine (rc1)
  		(print, Selected tool in magazine #<_selected_magazine>)
		o221 if [#<_rc1_alignment> EQ 0]
			#<_rc_x_load> = [[[#<_selected_tool> - 1] * #<_rc_pocket_offset> * #<_rc1_direction>] + #<_rc1_pckt_one_x>]
			(print, Load X set to #<_rc_x_load> for primary magazine)
			#<_rc_y_load> = #<_rc1_pckt_one_y>
			(print, Load Y set to #<_rc_y_load> for primary magazine)
		o221 else
			#<_rc_x_load> = #<_rc1_pckt_one_x>
			(print, Load X set to #<_rc_x_load> for primary magazine)
			#<_rc_y_load> = [[[#<_selected_tool> - 1] * #<_rc_pocket_offset> * #<_rc1_direction>] + #<_rc1_pckt_one_y>]
			(print, Load Y set to #<_rc_y_load> for primary magazine, Y alignment)
		o221 endif
	o206 elseif [#<_selected_tool> GT #<_rc1_pockets> AND #<_selected_tool> LE [#<_rc1_pockets> + #<_rc2_pockets>]]
  		#<_selected_magazine> = 2 ; 2nd magazine (rc2)
  		(print, Selected tool in magazine #<_selected_magazine>)
		(print, Loading from magazine #<_selected_magazine>)
		o222 if [#<_rc2_alignment> EQ 0]
			#<_temp1> = [#<_rc1_pockets> + 1]
			(print, Temp1: #<_temp1>)
			#<_temp2> = [#<_selected_tool> - #<_temp1>]
			(print, Temp2: #<_temp2>)
			#<_temp3> = [#<_temp2> * #<_rc_pocket_offset>]
			(print, Temp3: #<_temp3>)
			#<_temp4> = [#<_temp3> * #<_rc2_direction>]
			(print, Temp4: #<_temp4>)
			#<_rc_x_load> = [#<_temp4> + #<_rc2_pckt_one_x>]
			(print, Load X set to #<_rc_x_load> for secondary magazine)
			#<_rc_y_load> = #<_rc2_pckt_one_y>
			(print, Load Y set to #<_rc_y_load> for secondary magazine)
		o222 else
			#<_rc_x_load> = #<_rc2_pckt_one_x>
			(print, Load X set to #<_rc_x_load> for secondary magazine)
			#<_temp1> = [#<_rc1_pockets> + 1]
			#<_temp2> = [#<_selected_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc2_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc2_direction>]
			#<_rc_y_load> = [#<_temp4> + #<_rc2_pckt_one_y>]
			(print, Load Y set to #<_rc_y_load> for secondary magazine, Y alignment)
		o222 endif
	o206 elseif [#<_selected_tool> GT [#<_rc1_pockets> + #<_rc2_pockets>] AND [#<_selected_tool> LE [#<_rc1_pockets> + #<_rc2_pockets> + #<_rc3_pockets>]]]
		#<_selected_magazine> = 3 ; 3rd magazine (rc3)
  		(print, Selected tool in magazine #<_selected_magazine>)
		(print, Loading from magazine #<_selected_magazine>)
		o223 if [#<_rc3_alignment> EQ 0]
			#<_temp1> = [#<_rc1_pockets> + #<_rc2_pockets> + 1]
			(print, Temp1: #<_temp1>)
			#<_temp2> = [#<_selected_tool> - #<_temp1>]
			(print, Temp2: #<_temp2>)
			#<_temp3> = [#<_temp2> * #<_rc_pocket_offset>]
			(print, Temp3: #<_temp3>)
			#<_temp4> = [#<_temp3> * #<_rc3_direction>]
			(print, Temp4: #<_temp4>)
			#<_rc_x_load> = [#<_temp4> + #<_rc3_pckt_one_x>]
			(print, Load X set to #<_rc_x_load> for tertiary magazine)
			#<_rc_y_load> = #<_rc3_pckt_one_y>
			(print, Load Y set to #<_rc_y_load> for tertiary magazine)
		o223 else
			#<_rc_x_load> = #<_rc3_pckt_one_x>
			(print, Load X set to #<_rc_x_load> for tertiary magazine)
			#<_temp1> = [#<_rc1_pockets> + #<_rc2_pockets> + 1]
			#<_temp2> = [#<_selected_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc3_direction>]
			#<_rc_y_load> = [#<_temp4> + #<_rc3_pckt_one_y>]
		o223 endif
	o206 else 
		#<_selected_magazine> = 4 ; 4th magazine (rc4)
  		(print, Selected tool in magazine #<_selected_magazine>)
		(print, Loading from magazine #<_selected_magazine>)
		o224 if [#<_rc4_alignment> EQ 0]
			#<_temp1> = [#<_rc1_pockets> + #<_rc2_pockets> + #<_rc3_pockets> + 1]
			(print, Temp1: #<_temp1>)
			#<_temp2> = [#<_selected_tool> - #<_temp1>]
			(print, Temp2: #<_temp2>)
			#<_temp3> = [#<_temp2> * #<_rc_pocket_offset>]
			(print, Temp3: #<_temp3>)
			#<_temp4> = [#<_temp3> * #<_rc4_direction>]
			(print, Temp4: #<_temp4>)
			#<_rc_x_load> = [#<_temp4> + #<_rc4_pckt_one_x>]
			(print, Load X set to #<_rc_x_load> for quaternary magazine)
			#<_rc_y_load> = #<_rc4_pckt_one_y>
			(print, Load Y set to #<_rc_y_load> for quaternary magazine)
		o224 else
			#<_rc_x_load> = #<_rc4_pckt_one_x>
			(print, Load X set to #<_rc_x_load> for quaternary magazine)
			#<_temp1> = [#<_rc1_pockets> + #<_rc2_pockets> + #<_rc3_pockets> + 1]
			#<_temp2> = [#<_selected_tool> - #<_temp1>]
			#<_temp3> = [#<_temp2> * #<_rc_pocket_offset>]
			#<_temp4> = [#<_temp3> * #<_rc4_direction>]
			#<_rc_y_load> = [#<_temp4> + #<_rc4_pckt_one_y>]
		o224 endif
	o206 endif

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
	o300 elseif [#<_current_tool> GT [#<_rc1_pockets> + #<_rc2_pockets> + #<_rc3_pockets> + #<_rc4_pockets>]]
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
		(print, Wait 1 second for spindle to get to rpm)
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
					(print, Go to manual position)
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
	o400 elseif [#<_selected_tool> LE [#<_rc1_pockets> + #<_rc2_pockets> + #<_rc3_pockets> + #<_rc4_pockets>]]
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
		(print, Wait 1 second for spindle to get to rpm)

		#<_rc_times_plunged> = 0
		o410 while [#<_rc_times_plunged> LT #<_rc_plunge_count>]
			G53 G1 Z[#<_rc_engage_z>] F[#<_rc_engage_feed>]
			(print, Engage)
			G53 G1 Z[#<_rc_engage_z> + #<_rc_z_retreat_off>] F[#<_rc_engage_feed>]
			(print, Retreat)
			#<_rc_times_plunged> = [#<_rc_times_plunged> + 1]
			(print, Load plunge #<_rc_times_plunged> complete)
			G4 P1.5
			(print, Wait 1 second for spindle to get to rpm)
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
		; Is this the first measurement we are taking

		G53 G90 G0 Z[#<_rc_safe_z>]
		(print, Move to Z safe)
		G53 G0 X[#<_rc_measure_x>] Y[#<_rc_measure_y>]
		(print, Move to tool setter XY)
		G53 G0 Z[#<_rc_measure_start_z>]
		G4 P0.05
		(print, 1: #5422 2: #<_rc_measure-start_z>)

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
; ************* END TEARDOWN ***************