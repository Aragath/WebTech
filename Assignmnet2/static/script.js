const searchForm = document.getElementById('search-form');
const searchResult = document.getElementById('search-result'); // main div that contains all search results
const notFoundDiv = document.getElementById('not-found');
const resetButton = document.getElementById('reset-button');

const companyTab = document.getElementById('tab-company');
const summaryTab = document.getElementById('tab-summary');
const chartTab = document.getElementById('tab-chart');
const newsTab = document.getElementById('tab-news');

const resultCompany = document.getElementById('result-company');
const resultSummary = document.getElementById('result-summary');
const resultChart = document.getElementById('result-chart');
const resultNews = document.getElementById('result-news');  

var tabCache = {
    company: {},
    summary: {},
    recommend: {},
    chart: {},
    news: {},
};

// call all fetch function and save the data in cache
function fetchAll(searchInput) {
    const url1 = '/stock-search?search=' + encodeURIComponent(searchInput);
    const url2 = '/summary-search?search=' + encodeURIComponent(searchInput);
    const url3 = '/recommend-search?search=' + encodeURIComponent(searchInput);
    const url4 = '/chart-search?search=' + encodeURIComponent(searchInput);
    const url5 = '/news-search?search=' + encodeURIComponent(searchInput);

    Promise.all([
        fetch(url1).then(response => response.json()),
        fetch(url2).then(response => response.json()),
        fetch(url3).then(response => response.json()),
        fetch(url4).then(response => response.json()),
        fetch(url5).then(response => response.json())
    ])
    .then(([data1, data2, data3, data4, data5]) => {
        tabCache.company[searchInput] = data1;
        tabCache.summary[searchInput] = data2;
        tabCache.recommend[searchInput] = data3;
        tabCache.chart[searchInput] = data4;
        tabCache.news[searchInput] = data5;
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });
}

function stockSearch(event) {
    var companyImg = document.getElementById('result-company-img');
    var companyTable = document.getElementById('result-company-table');

    const searchInput = document.getElementById('search-input').value.toUpperCase();
    const url = '/stock-search?search=' + encodeURIComponent(searchInput);

    event.preventDefault();  // Prevent the form from reloading

    if (searchInput in tabCache.company) {
        resetAllElements();
        console.log('Date received from cache:', tabCache.company[searchInput]);
        handleApiResponse(tabCache.company[searchInput], notFoundDiv, companyImg, companyTable);
    }
    else {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error: Network response');
                }
                return response.json();
            })
            .then(data => {
                resetAllElements();
                console.log('Data received from Finnhub profile:', data);
                handleApiResponse(data, notFoundDiv, companyImg, companyTable);

                tabCache.company[searchInput] = data;
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
        }
}
function handleApiResponse(data, notFoundDiv, companyImg, companyTable) {
    if (Object.keys(data).length === 0) {
        console.log('No data received');
        handleNoRecordFound(notFoundDiv);
    } else {
        companyTab.classList.add('active');
        searchResult.style.display = 'flex';
        resultCompany.style.display = 'flex';
        // Update HTML elements with data received from the server
        companyImg.src = data.logo;
        companyTable.innerHTML = `
            <tr>
                <th>Company Name</th>
                <td>${data.name}</td>
            </tr>
            <tr>
                <th>Stock Ticker Symbol</th>
                <td>${data.ticker}</td>
            </tr>
            <tr>
                <th>Stock Exchange Code</th>
                <td>${data.exchange}</td>
            </tr>
            <tr>
                <th>Company Start Date</th>
                <td>${data.ipo}</td>
            </tr>
            <tr>
                <th>Category</th>
                <td>${data.finnhubIndustry}</td>
            </tr>
        `;
    }
}
function handleNoRecordFound(notFoundDiv) {
    console.log('No record found');
    notFoundDiv.textContent = `Error: No record has been found, please enter a valid symbol`;
    notFoundDiv.style.display = 'block';
    notFoundDiv.style.backgroundColor = '#E9E9E9';
}
function summaryTabClick() {
    const resultTable = document.getElementById('result-summary-table');

    searchInput = document.getElementById('search-input').value.toUpperCase();
    const url1 = '/summary-search?search=' + encodeURIComponent(searchInput);
    const url2 = '/recommend-search?search=' + encodeURIComponent(searchInput);

    if (searchInput in tabCache.summary) {
        resetAllElements();
        console.log('Date received from cache:', tabCache.summary[searchInput]);
        console.log('Date received from cache:', tabCache.recommend[searchInput]);
        handleSummaryResponse(tabCache.summary[searchInput], tabCache.recommend[searchInput], searchInput, resultTable)
    }
    else {
        Promise.all([
            fetch(url1).then(response => response.json()),
            fetch(url2).then(response => response.json())
        ])
        .then(([data1, data2]) => {
            resetAllElements();
            console.log('Data received from Finnhub quote:', data1);
            console.log('Data received from Finnhub recommendation:', data2);
            handleSummaryResponse(data1, data2, searchInput, resultTable);

            tabCache.summary[searchInput] = data1;
            tabCache.recommend[searchInput] = data2;
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
    }
}
function handleSummaryResponse(data1, data2, searchInput, resultTable) {
    summaryTab.classList.add('active');
    searchResult.style.display = 'flex';
    resultSummary.style.display = 'flex';

    var date = new Date(data1.t * 1000); // unix epoch time to date object, *1000 to convert to millisecond
    var day = date.getDate();
    var month = date.toLocaleString('en-US', { month: 'long' });
    var year = date.getFullYear();
    var formattedDate = `${day} ${month}, ${year}`;

    var changeImageSrc = data1.d > 0 ? '/static/Images/img/GreenArrowUp.png' : '/static/Images/img/RedArrowDown.png';
    var percentChangeImageSrc = data1.dp > 0 ? '/static/Images/img/GreenArrowUp.png' : '/static/Images/img/RedArrowDown.png';

    resultTable.innerHTML = `
        <tr>
            <th>Stock Ticker Symbol</th>
            <td>${searchInput}</td>
        </tr>
        <tr>
            <th>Trading Day</th>
            <td>${formattedDate}</td>
        </tr>
        <tr>
            <th>Previous Closing Price</th>
            <td>${data1.pc}</td>
        </tr>
        <tr>
            <th>Opening Price</th>
            <td>${data1.o}</td>
        </tr>
        <tr>
            <th>High Price</th>
            <td>${data1.h}</td>
        </tr>
        <tr>
            <th>Low Price</th>
            <td>${data1.l}</td>
        </tr>
        <tr>
            <th>Change</th>
            <td>${data1.d}<img src="${changeImageSrc}"></td>
        </tr>
        <tr>
            <th>Change Percent</th>
            <td>${data1.dp}<img src="${percentChangeImageSrc}"></td>
        </tr>
    `;

    document.getElementById('square1').innerHTML = data2[0].strongSell;
    document.getElementById('square2').innerHTML = data2[0].sell;
    document.getElementById('square3').innerHTML = data2[0].hold;
    document.getElementById('square4').innerHTML = data2[0].buy;
    document.getElementById('square5').innerHTML = data2[0].strongBuy;
}
function chartTabClick() {
    searchInput = document.getElementById('search-input').value.toUpperCase();
    const url = '/chart-search?search=' + encodeURIComponent(searchInput);

    if (searchInput in tabCache.chart) {
        resetAllElements();
        console.log('Date received from cache:', tabCache.chart[searchInput]);
        handleChartResponse(tabCache.chart[searchInput]);
    }
    else{
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error: Network response');
                }
                return response.json();
            })
            .then(data => {
                resetAllElements();
                console.log('Data received from Polygon:', data);
                handleChartResponse(data);

                tabCache.chart[searchInput] = data;
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    }
}
function handleChartResponse(data) {
    chartTab.classList.add('active');
    searchResult.style.display = 'flex';
    resultChart.style.display = 'flex';

    // create (date, price) array and (date, volume) array
    var datePriceArray = [];
    var dateVolumeArray = [];
    for (var i = 0; i < data.results.length; i++) {
        datePriceArray.push([data.results[i].t, data.results[i].c]);
        dateVolumeArray.push([data.results[i].t, data.results[i].v]);
    }

    // Create the chart
    Highcharts.stockChart('result-chart', {
        rangeSelector: {
            zoomType: 'x', // enable zoom
            allButtonsEnabled: true, // enable all buttons
            inputEnabled: false, // remove input box
            selected: 4, // set 6m as default
            buttons: [{
                'type': 'day',
                'count': 7,
                'text': '7d',
            }, {
                'type': 'day',
                'count': 15,
                'text': '15d',
            }, {
                'type': 'month',
                'count': 1,
                'text': '1m',
            }, {
                'type': 'month',
                'count': 3,
                'text': '3m',
            }, {
                'type': 'month',
                'count': 6,
                'text': '6m',
            }]
        },
        title: {
            text: 'Stock Price ' + data.ticker + ' ' + new Date().toISOString().split('T')[0],
            y: 10 // set title position
        },
        subtitle: {
            text: '<a href="https://polygon.io" target="_blank">Source: Polygon.io</a>',
            useHTML: true,
            y: 35
        },
        xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    day: '%e %b'
                },
        },
        yAxis: [{
            title: {
                text: 'Stock Price',
            },
            opposite: false, // move y-axis to the left
        },{
            title: {
                text: 'Volume',
            },
            max: 2.5 * Math.max(...dateVolumeArray.map(point => point[1])), // set max to shorten the bars
        }],
        plotOptions: {
            column: {
                pointWidth: 5, // make the column thinner
                color: 'black',
            },
        },
        series: [{
            pointPlacement: 'on',
            name: 'Stock Price',
            data: datePriceArray,
            type: 'area',
            threshold: null,
            yAxis: 0, // overlay two plots on same chart
            tooltip: {
                valueDecimals: 2
            },
            fillColor: {
                linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1
                },
                stops: [
                    [0, Highcharts.getOptions().colors[0]],
                    [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                ]
            }
        }, {
            pointPlacement: 'on',
            name: 'Volume', 
            data: dateVolumeArray,
            type: 'column',
            yAxis: 1,
        }],
    });
}
function newsTabClick() {
    searchInput = document.getElementById('search-input').value.toUpperCase();
    const url = '/news-search?search=' + encodeURIComponent(searchInput);

    if (searchInput in tabCache.news) {
        resetAllElements();
        console.log('Date received from cache:', tabCache.news[searchInput])
        handleNewsResponse(tabCache.news[searchInput]);
    }
    else{
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error: Network response');
                }
                return response.json();
            })
            .then(data => {
                resetAllElements();
                console.log('Data received from Finnhub news:', data);
                handleNewsResponse(data);

                tabCache.news[searchInput] = data;
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    }
}
function handleNewsResponse(data) {
    newsTab.classList.add('active');
    searchResult.style.display = 'flex';
    resultNews.style.display = 'flex';

    newsDiv = document.getElementById('result-news');
    count = 0;
    for (var i = 0; i < data.length; i++) {
        // check every key has value, else continue
        if (!data[i].category || !data[i].datetime || !data[i].headline || !data[i].id || !data[i].image || !data[i].related || !data[i].source || !data[i].summary || !data[i].url) {
            continue;
        }
        date = new Date(data[i].datetime * 1000);
        var day = date.getDate();
        var month = date.toLocaleString('en-US', { month: 'long' });
        var year = date.getFullYear();
        var formattedDate = `${day} ${month}, ${year}`;
        
        // Create a new div for each news article
        var newsArticle = document.getElementById('result-news-' + String(count + 1));
        newsArticle.style.display = 'flex';
        newsArticle.innerHTML = `
            <img src="${data[i].image}">
            <div style="padding-block: 15px;">
                <p>${data[i].headline}</p>
                <br>
                <p>${formattedDate}</p>
                <br>
                <a href="${data[i].url}" target="_blank">See Original Post</a>
            </div>
        `;

        count++;
        if (count === 5) {
            break;
        }
    }
}
function resetAllElements() {
    notFoundDiv.style.display = 'none';
    notFoundDiv.style.backgroundColor = 'white';

    searchResult.style.display = 'none';
    resultCompany.style.display = 'none';
    resultSummary.style.display = 'none';
    resultChart.style.display = 'none';
    resultNews.style.display = 'none';

    companyTab.classList.remove('active');
    summaryTab.classList.remove('active');
    chartTab.classList.remove('active');
    newsTab.classList.remove('active');

}

searchForm.addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the form from reloading
    tabCache = {
        company: {},
        summary: {},
        recommend: {},
        chart: {},
        news: {},
    };
    resetAllElements();
    const searchInput = document.getElementById('search-input').value.toUpperCase();
    fetchAll(searchInput);
    stockSearch(event);
});

// searchForm.addEventListener('submit', stockSearch);
resetButton.addEventListener('click', function() {
    tabCache = {
        company: {},
        summary: {},
        recommend: {},
        chart: {},
        news: {},
    };
    resetAllElements();
});
companyTab.addEventListener('click', function(event) {
    companyTab.classList.add('active');
    summaryTab.classList.remove('active');
    chartTab.classList.remove('active');
    newsTab.classList.remove('active');
    
    stockSearch(event);
});
summaryTab.addEventListener('click', function() {
    companyTab.classList.remove('active');
    summaryTab.classList.add('active');
    chartTab.classList.remove('active');
    newsTab.classList.remove('active');
    
    summaryTabClick();
});
chartTab.addEventListener('click', function() {
    companyTab.classList.remove('active');
    summaryTab.classList.remove('active');
    chartTab.classList.add('active');
    newsTab.classList.remove('active');

    chartTabClick();
});
newsTab.addEventListener('click', function() {
    companyTab.classList.remove('active');
    summaryTab.classList.remove('active');
    chartTab.classList.remove('active');
    newsTab.classList.add('active');

    newsTabClick();
});

