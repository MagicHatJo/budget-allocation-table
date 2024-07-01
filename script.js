
const allocationsDiv   = document.getElementById('allocations');
const totalBudgetInput = document.getElementById('totalBudget');
const darkModeToggle   = document.getElementById('darkModeToggle');
const clearCookiesBtn  = document.getElementById('clearCookiesBtn');

let allocations = [];

// Event listeners
totalBudgetInput.addEventListener('change', updateAllocations);
darkModeToggle.addEventListener('click', toggleDarkMode);
clearCookiesBtn.addEventListener('click', clearCookies);

// Toggles between light and dark mode
function toggleDarkMode() {
	document.body.classList.toggle('dark-mode');
	darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? 'Toggle Light Mode' : 'Toggle Dark Mode';
	saveToCookie();
}

// Adds a new empty allocation to the list
function addAllocation() {
	allocations.push({ tag: '', amount: '', percentage: '', lastUsed: '' });
	updateAllocations();
}

// Removes an allocation from the list
function deleteAllocation(index) {
	allocations.splice(index, 1);
	updateAllocations();
}

// Updates a specific allocation
function updateAllocation(index, field, value) {
	const totalBudget = parseFloat(totalBudgetInput.value) || 0;

	if (field === 'amount') {
		allocations[index].amount     = value;
		allocations[index].percentage = totalBudget > 0 ? ((parseFloat(value) || 0) / totalBudget * 100).toFixed(2) : '';
		allocations[index].lastUsed   = 'amount';
	} else if (field === 'percentage') {
		allocations[index].percentage = value;
		allocations[index].amount     = ((parseFloat(value) || 0) / 100 * totalBudget).toFixed(2);
		allocations[index].lastUsed   = 'percentage';
	} else {
		allocations[index][field] = value;
	}
	updateAllocations();
}

// Updates all allocations and the UI
function updateAllocations() {
	const totalBudget = parseFloat(totalBudgetInput.value) || 0;
	
	// Recalculate allocations based on last used input
	allocations.forEach(allocation => {
		if (allocation.lastUsed === 'amount') {
			allocation.percentage = totalBudget > 0 ? ((parseFloat(allocation.amount) || 0) / totalBudget * 100).toFixed(2) : '';
		} else if (allocation.lastUsed === 'percentage') {
			allocation.amount = ((parseFloat(allocation.percentage) || 0) / 100 * totalBudget).toFixed(2);
		}
	});

	// Clear existing allocations
	allocationsDiv.innerHTML = '<h2>Allocations</h2>';
	
	// Create table for allocations
	let table = `<table>
		<tr>
			<th>Tag</th>
			<th>Amount</th>
			<th>Percentage</th>
			<th></th>
		</tr>`;
	
	// Add rows for each allocation
	allocations.forEach((allocation, index) => {
		table += `<tr>
			<td class="editable-cell"><input type="text" value="${allocation.tag}" onchange="updateAllocation(${index}, 'tag', this.value)"></td>
			<td class="editable-cell"><input type="number" value="${allocation.amount}" onchange="updateAllocation(${index}, 'amount', this.value)"></td>
			<td class="editable-cell"><input type="number" value="${allocation.percentage}" onchange="updateAllocation(${index}, 'percentage', this.value)"></td>
			<td><button class="delete-btn" onclick="deleteAllocation(${index})">x</button></td>
		</tr>`;
	});

	// Add button to add new allocation
	table += `<tr>
		<td colspan="4"><button onclick="addAllocation()">+</button></td>
	</tr>`;

	table += '</table>';
	allocationsDiv.innerHTML += table;

	// Calculate and display summary
	let totalAllocated = allocations.reduce((sum, allocation) => sum + (parseFloat(allocation.amount) || 0), 0);
	const remainingBudget = totalBudget - totalAllocated;
	const remainingPercentage = totalBudget > 0 ? ((remainingBudget / totalBudget) * 100).toFixed(2) : 0;

	const summaryDiv = document.createElement('div');
	summaryDiv.className = 'summary';
	summaryDiv.innerHTML = `<strong>Total Allocated:</strong> $${totalAllocated.toFixed(2)} (${((totalAllocated / totalBudget) * 100).toFixed(2)}%)<br>
							<strong>Remaining Budget:</strong> $${remainingBudget.toFixed(2)} (${remainingPercentage}%)`;
	allocationsDiv.appendChild(summaryDiv);

	saveToCookie();
}

// Saves the current state to a cookie
function saveToCookie() {
	const data = {
		totalBudget: totalBudgetInput.value,
		allocations: allocations,
		darkMode: document.body.classList.contains('dark-mode')
	};
	document.cookie = `budgetData=${JSON.stringify(data)}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
}

// Loads the state from the cookie
function loadFromCookie() {
	const cookies = document.cookie.split(';');
	const budgetCookie = cookies.find(cookie => cookie.trim().startsWith('budgetData='));
	if (budgetCookie) {
		const data = JSON.parse(budgetCookie.split('=')[1]);
		totalBudgetInput.value = data.totalBudget;
		allocations = data.allocations;
		if (data.darkMode) {
			document.body.classList.add('dark-mode');
			darkModeToggle.textContent = 'Toggle Light Mode';
		} else {
			document.body.classList.remove('dark-mode');
			darkModeToggle.textContent = 'Toggle Dark Mode';
		}
		updateAllocations();
	} else {
		addAllocation();
	}
}

// Clears the cookie and reloads the page
function clearCookies() {
	document.cookie = 'budgetData=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
	location.reload();
}

// Load data from cookie on page load
loadFromCookie();