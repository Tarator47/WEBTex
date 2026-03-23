let currentPage = 1;
const limit = 1000;

let withCursorAfterHistory = [null];
let withCursorIndex = 0;

// Lists to store data for both methods
const noCursorData = [];
const withCursorData = [];

const avgNoCursorTimeDisplay = document.createElement('p');
avgNoCursorTimeDisplay.id = 'avg-no-cursor-time';
avgNoCursorTimeDisplay.textContent = 'Average Time (No Cursor): - ms';
document.body.insertBefore(avgNoCursorTimeDisplay, document.getElementById('performanceChart').parentElement);

const avgWithCursorTimeDisplay = document.createElement('p');
avgWithCursorTimeDisplay.id = 'avg-with-cursor-time';
avgWithCursorTimeDisplay.textContent = 'Average Time (With Cursor): - ms';
document.body.insertBefore(avgWithCursorTimeDisplay, document.getElementById('performanceChart').parentElement);

async function fetchDataForBothSections(page) {
    const methods = ['no-cursor', 'with-cursor'];

    for (const method of methods) {
        let url;
        if (method === 'with-cursor') {
            const after = withCursorAfterHistory[withCursorIndex];
            url = `/with-cursor?limit=${limit}` + (after ? `&after=${after}` : '');
        } else {
            url = `/${method}?page=${page}&limit=${limit}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error fetching data for ${method}: ${response.statusText}`);
            continue;
        }

        const data = await response.json();
        const outputId = method === 'no-cursor' ? 'no-cursor-output' : 'with-cursor-output';

        document.getElementById(outputId).textContent = JSON.stringify(data.data, null, 2);

        // Add new data to the respective list
        if (method === 'no-cursor') {
            noCursorData.push({ page, time: data.timeTaken });
        } else {
            withCursorData.push({ page, time: data.timeTaken });
            // update cursor history: store last _id for next page
            if (Array.isArray(data.data) && data.data.length > 0) {
                const lastId = data.data[data.data.length - 1]._id;
                // if we're at the end of history (normal next), push
                if (withCursorIndex === withCursorAfterHistory.length - 1) {
                    withCursorAfterHistory.push(lastId);
                    withCursorIndex++;
                } else {
                    // if we've navigated back and then fetched a new forward page, overwrite history
                    withCursorIndex++;
                    withCursorAfterHistory[withCursorIndex] = lastId;
                    withCursorAfterHistory.length = withCursorIndex + 1;
                }
            }
        }
    }

    // Update the chart with the data from both lists
    updateChartWithLists();
}

function updateChartWithLists() {
    // Clear the chart data
    performanceChart.data.labels = [];
    performanceChart.data.datasets[0].data = []; // No Cursor dataset
    performanceChart.data.datasets[1].data = []; // With Cursor dataset

    // Populate the chart with data from the lists
    noCursorData.forEach(entry => {
        performanceChart.data.labels.push(entry.page);
        performanceChart.data.datasets[0].data.push(entry.time);
    });

    withCursorData.forEach(entry => {
        if (!performanceChart.data.labels.includes(entry.page)) {
            performanceChart.data.labels.push(entry.page);
        }
        performanceChart.data.datasets[1].data.push(entry.time);
    });

    performanceChart.update();

    // Calculate and display the average times
    const avgNoCursorTime = noCursorData.reduce((sum, entry) => sum + parseFloat(entry.time), 0) / noCursorData.length;
    const avgWithCursorTime = withCursorData.reduce((sum, entry) => sum + parseFloat(entry.time), 0) / withCursorData.length;

    avgNoCursorTimeDisplay.textContent = `Average Time (No Cursor): ${avgNoCursorTime.toFixed(2)} ms`;
    avgWithCursorTimeDisplay.textContent = `Average Time (With Cursor): ${avgWithCursorTime.toFixed(2)} ms`;
}

document.getElementById('next-page').addEventListener('click', () => {
    currentPage++;
    fetchDataForBothSections(currentPage);
});

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchDataForBothSections(currentPage);
    }
});

// Fetch data for both sections on page load
window.addEventListener('load', () => {
    fetchDataForBothSections(currentPage);
});