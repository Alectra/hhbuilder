// -------------- VARIABLES -------------- //
// Get all of the main form elements for easy reference
var theBuilder = document.querySelector('.builder');
var theFormArea = document.querySelector('.builder form');
var theHouseholdArea = document.querySelector('.household');
var theDebugArea = document.querySelector('.debug');

var household = [];	// The list of household entries


// -------------- INIT -------------- //
// Create the "preview" div area and add to display the household preview
var thePreviewArea = document.createElement("div");
thePreviewArea.setAttribute('class', 'preview');

// Create the "errors" div area and add to display the entry errors
var theErrorsArea = document.createElement("div");
theErrorsArea.setAttribute('class', 'errors');

// Add new divs to DOM
document.body.onload = AddElements;
function AddElements() {
	document.body.insertBefore(thePreviewArea, theDebugArea);
	UpdatePreviewDisplay();
	document.body.insertBefore(theErrorsArea, thePreviewArea);
}

// -------------- LISTENERS -------------- //
// Add listener for "add" button
theFormArea.querySelector('.add').addEventListener('click', function (e) {
	e.preventDefault();
	AddEntry();
	return false;
});

// Add listener for "submit" button
theFormArea.querySelector('button[type="submit"]').addEventListener('click', function (e) {
	e.preventDefault();
	SubmitHousehold();
	return false;
});

// -------------- MAIN FUNCTIONS (ADD/REMOVE SUBMIT) -------------- //
// add people to a growing household list
function AddEntry() {
	UpdateErrorsDisplay('');
	var index =  household.length;
	var tmpId = index + 1;
	var tmpAge = document.querySelector('input[name="age"]').value;
	var tmpSmoker = document.querySelector('input[name="smoker"]').checked;

	var rel = document.querySelector('select[name="rel"]');
	var tmpRel = rel.options[rel.selectedIndex].value;

	// console.log(tmpId + " " + tmpAge + " " + tmpRel + " " + tmpSmoker);
	if (ValidateAge(tmpAge) && ValidateRelationship(tmpRel)) {
		var entry = {
			id: tmpId,
			age: tmpAge,
			rel: tmpRel,
			smoker: tmpSmoker
		}
		household[index] = entry;
		UpdatePreviewDisplay();
	}
	else {
		var errorText = '<p>Failed to add entry. ' + GenerateErrors(ValidateAge(tmpAge), ValidateRelationship(tmpRel)) + '</p>';
		UpdateErrorsDisplay(errorText);

	}
}

// remove a previously added person from the list
function RemoveEntry(tmpId) {
	for (var i = 0; i < household.length; i++) {
		if (household[i].id == tmpId) {
			household.splice(i, 1);
		}
	}
	UpdateHouseholdIds();
	UpdatePreviewDisplay();
	return false;
}

// Serialize the household as JSON upon form submission as a fake server trip
var skipServerSubmission = true;	//this would be false in the real application or removed altogether
function SubmitHousehold() {
	console.log("submitting household")
	if (!skipServerSubmission) {
		var xhr = new XMLHttpRequest();

		// set XHR headers
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4 && xhr.status === 200) {
				console.log(xhr.responseText);
				// Display Success Message
				// UpdateErrorsDisplay("Household Submitted Successfully!");
			}
			else {
				console.log(xhr.responseText);
				// Display Failure Message
				// UpdateErrorsDisplay("There was an error communicating with the server, household not submitted");
				// More information could be added as needed to help the user identify the problem.
			}
		};

		// open and send the post request
		xhr.open('POST', 'https://myweb.com/action-target', true);
		xhr.send(JSON.stringify(household));
	}

	UpdateDebugDisplay(JSON.stringify(household,null,4));
}

// -------------- VALIDATION -------------- //
// Validate data entry: age is required and > 0
function ValidateAge(age) {
	if (!isNaN(age) && age > 0)
		return true;
	else
		return false;
}

// Validate data entry: relationship is required
function ValidateRelationship(rel) {
	if (rel != '')
		return true;
	else
		return false;
}

// -------------- UPDATE DATA -------------- //
// reset ids for household members after one has been removed
function UpdateHouseholdIds() {
	for (var i = 0; i < household.length; i++) {
		household[i].id = i + 1;
	}
}

// display error messages to the user
function UpdateErrorsDisplay(errorText) {
	theErrorsArea.innerHTML = errorText;
}

// display the household list in the HTML as it is modified
function UpdatePreviewDisplay() {
	thePreviewArea.innerHTML = "";
	var tbl = document.createElement("table");
	var tblBody = document.createElement("tbody");

	// Create Table Headings
	var previewCategories = ['Id', 'Age', 'Relationship', 'Smoker', ''];
	var heading = document.createElement("tr");
	for (i = 0; i < previewCategories.length; i++) {
		var headingCell = document.createElement("td");
		var headingCellText = document.createTextNode(previewCategories[i]);
		headingCell.appendChild(headingCellText);
		heading.appendChild(headingCell);
	}
	tblBody.appendChild(heading);

	if (household.length > 0) {
		for (var j = 0; j < household.length; j++) {
			var row = document.createElement("tr");

			var idCell = document.createElement("td");
			var idCellText = document.createTextNode(household[j].id);
			idCell.appendChild(idCellText);
			row.appendChild(idCell);

			var ageCell = document.createElement("td");
			var ageCellText = document.createTextNode(household[j].age);
			ageCell.appendChild(ageCellText);
			row.appendChild(ageCell);

			var rel = document.createElement("td");
			var relCellText = document.createTextNode(household[j].rel);
			rel.appendChild(relCellText);
			row.appendChild(rel);

			var smokerCell = document.createElement("td");
			var smokerCellText = document.createTextNode(household[j].smoker);
			smokerCell.appendChild(smokerCellText);
			row.appendChild(smokerCell);

			var removeCell = document.createElement("button");
			// var removeCellText = document.createTextNode("Remove");
			removeCell.innerHTML = 'Remove';
			removeCell.value = household[j].id;
			removeCell.onclick = function () {
				RemoveEntry(this.value);
			};
			// removeCell.appendChild(removeCellText);
			row.appendChild(removeCell);

			tblBody.appendChild(row);
		}
		// put the <tbody> in the <table>
		tbl.appendChild(tblBody);
		// appends <table> into <body>
		thePreviewArea.appendChild(tbl);
	}
}

// PUT SUBMISSION (serialized JSON) in "debug" DOM element and display it
function UpdateDebugDisplay(responseData) {
	theDebugArea.innerHTML = responseData;
	theDebugArea.style = "display:block";;
}

// Generate validation errors
function GenerateErrors(ageOk, relOk) {
	var errorText = '<span><b>Errors Encountered:</b> ';
	if (!ageOk)
		errorText += "</br>-AGE cannot be blank and older than 0."
	if (!relOk)
		errorText += "</br>-RELATIONSHIP cannot be blank."

	errorText += '</span>';

	return errorText;
}