angular.module('ReportsTabController', ['APIService', 'SettingsService', 'ngMaterial', 'ngFileSaver'])

.controller('ReportsTabController', function ReportsTabController($scope, $rootScope, FileSaver, Blob, Projects, MapSettings, ProjectSettings, Reports, APP_CONFIG, $mdDialog, $mdToast, $q)
{
	$scope.reportClicked = function(event, type) {
		//console.log("reportClicked, boxExtent = " + $scope.boxExtent);
		console.log(event);
		if (MapSettings.data.aoi == undefined) {
			showAOIalert(event);
		} else {
			showReportDialog(event, type);
		}
	}
	
    let showAOIalert = function(event) {
 		console.log("show AOI alert");
		alert = $mdDialog.alert({
			title: 'AOI required',
			textContent: 'Please specify an Area of Interest first.',
			targetEvent: event,
			ok: 'Ok'
		});

		$mdDialog
			.show( alert )
			.finally(function() {
				alert = undefined;
			});
    }
	
    let showReportDialog = function(event, type) {
 		console.log("show report");
		alert = $mdDialog.alert({
			title: type.charAt(0).toUpperCase() + type.slice(1) + ' Report',
			//textContent: '<tabular results here>',
			locals: { reportName: type.charAt(0).toUpperCase() + type.slice(1) },
			controller: DialogController,
			templateUrl: 'tabs/reports/report_dialog.html',
			targetEvent: event,
			ok: 'Done'
		});
		function DialogController($scope, $mdDialog, reportName) {
			$scope.reportName = reportName;
			$scope.implemented = (reportName === 'Contact' || reportName === 'Military Encroachment' || reportName === 'Permitting' || reportName ==='Infrastructure' || reportName === 'Environmental');
			//TODO: Probably should hit the Reports endpoint from a service rather than here
			//TODO: Column headers should not be hard-coded in report_dialog.html if that file is to be generic.
			/*
			if (reportName === 'Contact') {
				//$scope.results = Reports.get({report: 'contact', filter: '{"type":"Polygon","coordinates":[[[-110.71287778,32.27194444],[-109.19132222,32.27194444],[-109.19132222,33.01055556],[-110.71287778,33.01055556],[-110.71287778,32.27194444]]]}'});
				$scope.results = Reports.get({report: 'contact', filter: new ol.format.GeoJSON().writeGeometry(MapSettings.data.aoi.clone().transform("EPSG:3857", "EPSG:4326"))});
				$scope.results.$promise.catch(function() {$scope.error = "There was a problem communicating with the server"; console.log($scope.error);});
			}
			*/
			$scope.results = Reports.get({report: reportName, filter: new ol.format.GeoJSON().writeGeometry(MapSettings.data.aoi.clone().transform("EPSG:3857", "EPSG:4326"))});
			$scope.results.$promise.catch(function() {$scope.error = "There was a problem communicating with the server"; console.log($scope.error);});
			
			$scope.closeDialog = function() {
				$mdDialog.hide();
			}
			

			$scope.csvDownloadClicked = function() {
				if (reportName === "Contact") {
					let csvStr = 'First Name,Last Name,Title,Department,Agency Name,Agency Type,Phone,Email,Address\n';
					$scope.results.records.forEach(function(contact) {
						csvStr += '"' + contact.first_name + '","' + contact.last_name + '","' + contact.position_title + '","' + contact.department + '","' + contact.agency_name + '","' + contact.agency_type + '","' + contact.phone + '","' + contact.email + '","' + contact.street + ", " +contact.city + ", "  + contact.state + ", " + contact.zip_code + '"\n';
					});
					
					console.log("csv = " + csvStr);
					
					let data = new Blob([csvStr], { type: 'text/plain;charset=utf-8' });
					let dateStr = new Date().toLocaleDateString();
					FileSaver.saveAs(data, "ContactReport - " + dateStr + ".csv");
				} else if (reportName === "Military Encroachment") {
					let csvStr = 'Mil Zone ID,Restriction Type,Service,Minimum Altitude,Description,Office,Contact\n';
					$scope.results.records.forEach(function(r) {
						csvStr += '"' + r.military_zone_id + '","' + r.restriction_type + '","' + r.service + '","' + r.minimum_altitude + '","' + r.comment + '","' + r.office + '","' + r.contact_name + ", " +r.contact_email + ", "  + r.contact_phone + '"\n';
					});
					
					console.log("csv = " + csvStr);
					
					let data = new Blob([csvStr], { type: 'text/plain;charset=utf-8' });
					let dateStr = new Date().toLocaleDateString();
					FileSaver.saveAs(data, "MilitaryEncroachmentReport - " + dateStr + ".csv");
				}
				
			}
			
			
			$scope.pdfDownloadClicked = function() {
				console.log("pdfDownloadClicked, " + reportName);

				if (reportName === "Contact") {
					html2canvas(document.getElementById('introText'), {
						onrendered: function (canvas) {
							let data = canvas.toDataURL();
							
							let dateStr = new Date().toLocaleDateString();
							
							let docDef = {
								pageOrientation: 'landscape',
								footer: function(currentPage, pageCount) { return { text: currentPage.toString() + ' of ' + pageCount, alignment: 'right', margin: [20, 2] }; },
								content: [
									{ text: 'Contact Report ' + dateStr, fontSize: 22, bold:true },
									{image: data, width: 740},
									{table: {
										headerRows: 1,
										dontBreakRows: true,
										body: [
											[
												{text: 'First Name', bold:true}, 
												{text: 'Last Name', bold:true},
												{text: 'Title', bold:true},
												{text: 'Department', bold:true},
												{text: 'Agency Name', bold:true}, 
												{text: 'Agency Type', bold:true},
												{text: 'Phone', bold:true}, 
												{text: 'Email', bold:true},
												{text: 'Address', bold:true}
											]
										],
										fontSize: 10
									}}
								]
							}

							//for (contact in $scope.results.records) {
							$scope.results.records.forEach(function(contact) {
								docDef.content[2].table.body.push([contact.first_name, contact.last_name, contact.position_title, contact.department, contact.agency_name, contact.agency_type, contact.phone, contact.email,  contact.street + ", " +contact.city + ", "  + contact.state + ", " + contact.zip_code]);
							});

							
							pdfMake.createPdf(docDef).download("ContactReport - " + dateStr + ".pdf");
							
						}
					});		
				} else if (reportName === "Military Encroachment") {
					document.getElementById('introText').scrollIntoView();
					html2canvas(document.getElementById('introText'), {
						logging: true,
						onrendered: function (introCanvas) {
							document.getElementById('endText').scrollIntoView();
							html2canvas(document.getElementById('endText'), {
								logging: true,
								onrendered: function (endCanvas) {	
									let introData = introCanvas.toDataURL();
									console.log("introData = "); console.log(introData);
									console.log("introCanvas = "); console.log(introCanvas);
									let endData = endCanvas.toDataURL();
									console.log("endData = "); console.log(endData);
									console.log("endCanvas = "); console.log(endCanvas);
									
									let dateStr = new Date().toLocaleDateString();

									/*******
									//This version displays results in a simple table
									let docDef = {
										pageOrientation: 'landscape',
										footer: function(currentPage, pageCount) { return { text: currentPage.toString() + ' of ' + pageCount, alignment: 'right', margin: [20, 2] }; },
										content: [
											{ text: 'Military Encroachment Report ' + dateStr, fontSize: 22, bold:true },
											{image: introData, width: 740},
											{table: {
												headerRows: 1,
												dontBreakRows: true,
												body: [
													[
														{text: 'Mil Zone ID', bold:true}, 
														{text: 'Restriction Type', bold:true},
														{text: 'Service', bold:true},
														{text: 'Minimum Altitude', bold:true},
														{text: 'Description', bold:true}, 
														{text: 'Office', bold:true},
														{text: 'Contact', bold:true}
													]
												],
												fontSize: 10
											}},
											{image: endData, width: 740}
										]
									}

									$scope.results.records.forEach(function(r) {
										docDef.content[2].table.body.push([r.military_zone_id, r.restriction_type, r.service, r.minimum_altitude, r.comment, r.office, r.contact_name + ", " +r.contact_email + ", "  + r.contact_phone]);
									});
									********/
									
								
									let docDef = {
										pageOrientation: 'landscape',
										footer: function(currentPage, pageCount) { return { text: currentPage.toString() + ' of ' + pageCount, alignment: 'right', margin: [20, 2] }; },
										content: [
											{ text: 'Military Encroachment Report ' + dateStr, fontSize: 22, bold:true },
											{image: introData, width: 740}
										]
									};
									
									$scope.results.records.forEach(function(r) {
										let table = {
											table: {
												dontBreakRows: true,
												body: [
													[
														{
															table: {
																widths: ['*','*','*','*'],
																headerRows: 1,
																dontBreakRows: true,
																body: [
																	[
																		{text: 'Mil Zone ID', bold:true}, 
																		{text: 'Restriction Type', bold:true},
																		{text: 'Service', bold:true},
																		{text: 'Minimum Altitude', bold:true}
																	],
																	[
																		r.military_zone_id, 
																		r.restriction_type, 
																		r.service, 
																		r.minimum_altitude
																	]
																]
															}
														}
													],
													[
														[
															{
																table: {
																	headerRows: 0,
																	dontBreakRows: true,
																	body: [
																		[
																			r.comment
																		]
																	]
																}
															}
														]
													],
													[
														{
															table: {
																widths: ['auto','*'],
																headerRows: 1,
																dontBreakRows: true,
																body: [
																	[
																		{text: 'Office', bold:true}, 
																		{text: 'Contact', bold:true}
																	],
																	[
																		r.office,
																		r.contact_name,// + ", " +r.contact_email + ", "  + r.contact_phone
																	]
																]
															}
														}
													]
												]
											}	
										}
												
										docDef.content.push(table);
									});
									
									docDef.content.push({image: endData, width: 740});
									
									pdfMake.createPdf(docDef).download("MilitaryEncroachmentReport - " + dateStr + ".pdf");
								}
							});
						}
					});	
				}
			}
		}

		$mdDialog
			.show( alert )
			.finally(function() {
				alert = undefined;
			});
	}
	
	
});