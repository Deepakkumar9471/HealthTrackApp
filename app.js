// Main application script

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tab navigation
    initializeTabs();
    
    // Initialize charts
    initializeCharts();
    
    // Add event listeners for buttons
    document.getElementById('add-activity-btn')?.addEventListener('click', showAddActivityModal);
    document.getElementById('add-goal-btn')?.addEventListener('click', showAddGoalModal);
    
    // Fetch initial data
    fetchDashboardData();
    fetchActivities();
    fetchGoals();
});

// Tab navigation
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding content
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Initialize charts
function initializeCharts() {
    // Steps history chart
    const stepsCtx = document.getElementById('stepsChart').getContext('2d');
    window.stepsChart = new Chart(stepsCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Steps',
                data: [8543, 9128, 7439, 10284, 9284, 8172, 9346],
                backgroundColor: 'rgba(94, 111, 255, 0.1)',
                borderColor: '#5e6fff',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#5e6fff',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#9a9dbb'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#9a9dbb'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#9a9dbb'
                    }
                },
                tooltip: {
                    backgroundColor: '#1e2141',
                    titleColor: '#ffffff',
                    bodyColor: '#9a9dbb',
                    borderColor: '#2a2d4a',
                    borderWidth: 1,
                    displayColors: false,
                    cornerRadius: 8
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // Metrics chart for analytics page
    const metricsCtx = document.getElementById('metricsChart')?.getContext('2d');
    if (metricsCtx) {
        window.metricsChart = new Chart(metricsCtx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Steps',
                    data: [8520, 6898, 5724, 7784, 10005, 10477, 9451],
                    backgroundColor: function(context) {
                        const chartArea = context.chart.chartArea;
                        if (!chartArea) {
                            return null;
                        }
                        const gradient = context.chart.ctx.createLinearGradient(
                            0, chartArea.bottom, 0, chartArea.top
                        );
                        gradient.addColorStop(0, 'rgba(94, 111, 255, 0.8)');
                        gradient.addColorStop(1, 'rgba(139, 109, 255, 0.8)');
                        return gradient;
                    },
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#9a9dbb'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#9a9dbb'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#9a9dbb'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e2141',
                        titleColor: '#ffffff',
                        bodyColor: '#9a9dbb',
                        borderColor: '#2a2d4a',
                        borderWidth: 1,
                        displayColors: false,
                        cornerRadius: 8
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // Heart rate zones chart
    const heartRateCtx = document.getElementById('heartRateChart')?.getContext('2d');
    if (heartRateCtx) {
        window.heartRateChart = new Chart(heartRateCtx, {
            type: 'doughnut',
            data: {
                labels: ['Rest', 'Fat Burn', 'Cardio', 'Peak'],
                datasets: [{
                    data: [15, 45, 30, 10],
                    backgroundColor: [
                        '#5e6fff',
                        '#38ef7d',
                        '#ff736e',
                        '#ffde59'
                    ],
                    borderWidth: 0,
                    borderRadius: 5
                }]
            },
            options: {
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#9a9dbb',
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e2141',
                        titleColor: '#ffffff',
                        bodyColor: '#9a9dbb',
                        borderColor: '#2a2d4a',
                        borderWidth: 1,
                        cornerRadius: 8
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// Show modal to add new activity
function showAddActivityModal() {
    alert('Add Activity modal would appear here');
    // In a real app, would show a modal with form to add activity
}

// Show modal to add new goal
function showAddGoalModal() {
    alert('Add Goal modal would appear here');
    // In a real app, would show a modal with form to add goal
}

// Fetch dashboard data from API
function fetchDashboardData() {
    fetch('/api/health/dashboard?userId=default')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }
            return response.json();
        })
        .then(data => {
            console.log('Dashboard data loaded:', data);
            
            // Update metrics on the dashboard
            if (data.dailyMetrics) {
                // Update steps
                Array.from(document.querySelectorAll('.card-title')).filter(el => el.textContent.includes('Steps')).forEach(el => {
                    const cardBody = el.closest('.card-body');
                    if (cardBody) {
                        const stepsValueElement = cardBody.querySelector('h2.card-text');
                        if (stepsValueElement) {
                            stepsValueElement.textContent = data.dailyMetrics.steps.toLocaleString();
                        }
                        
                        // Update progress bar if target exists
                        const progressBar = cardBody.querySelector('.progress-bar');
                        if (progressBar && data.goals) {
                            const stepsGoal = data.goals.find(goal => goal.name === 'Daily Steps');
                            if (stepsGoal) {
                                const progress = Math.min(Math.round((data.dailyMetrics.steps / stepsGoal.target) * 100), 100);
                                progressBar.style.width = `${progress}%`;
                                progressBar.setAttribute('aria-valuenow', progress);
                                
                                // Update progress text
                                const progressText = cardBody.querySelector('small.text-muted');
                                if (progressText) {
                                    progressText.textContent = `${progress}% of daily goal`;
                                }
                            }
                        }
                    }
                });
                
                // Update heart rate
                Array.from(document.querySelectorAll('.card-title')).filter(el => el.textContent.includes('Heart Rate')).forEach(el => {
                    const cardBody = el.closest('.card-body');
                    if (cardBody) {
                        const heartRateElement = cardBody.querySelector('h2.card-text');
                        if (heartRateElement) {
                            heartRateElement.innerHTML = `${data.dailyMetrics.heartRate} <small>bpm</small>`;
                        }
                    }
                });
                
                // Update calories
                Array.from(document.querySelectorAll('.card-title')).filter(el => el.textContent.includes('Calories')).forEach(el => {
                    const cardBody = el.closest('.card-body');
                    if (cardBody) {
                        const caloriesElement = cardBody.querySelector('h2.card-text');
                        if (caloriesElement) {
                            caloriesElement.textContent = data.dailyMetrics.calories.toLocaleString();
                        }
                        
                        // We could update calorie progress here but we don't have a calorie goal in the data
                    }
                });
            }
            
            // Update the steps chart if we have weekly data
            if (data.weeklyMetrics && window.stepsChart) {
                const labels = data.weeklyMetrics.map(day => day.label);
                const values = data.weeklyMetrics.map(day => day.value);
                
                window.stepsChart.data.labels = labels;
                window.stepsChart.data.datasets[0].data = values;
                window.stepsChart.update();
            }
            
            // Update goals section
            if (data.goals && data.goals.length > 0) {
                const goalsContainer = document.querySelector('#goals-tab .row');
                if (goalsContainer) {
                    goalsContainer.innerHTML = '';
                    
                    data.goals.forEach(goal => {
                        const progress = Math.min(Math.round((goal.current / goal.target) * 100), 100);
                        const colorClass = progress >= 100 ? 'bg-success' : 'bg-info';
                        
                        const goalCard = document.createElement('div');
                        goalCard.className = 'col-md-6';
                        goalCard.innerHTML = `
                            <div class="card mb-4">
                                <div class="card-body">
                                    <h5 class="card-title">${goal.name}</h5>
                                    <div class="progress mb-3">
                                        <div class="progress-bar ${colorClass}" role="progressbar" 
                                             style="width: ${progress}%" 
                                             aria-valuenow="${progress}" 
                                             aria-valuemin="0" 
                                             aria-valuemax="100">${progress}%</div>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <span>Current: ${goal.current.toLocaleString()} ${goal.unit}</span>
                                        <span>Target: ${goal.target.toLocaleString()} ${goal.unit}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                        
                        goalsContainer.appendChild(goalCard);
                    });
                }
            }
        })
        .catch(error => {
            console.error('Error fetching dashboard data:', error);
        });
}

// Fetch activities
function fetchActivities() {
    fetch('/api/activities?userId=default')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch activities');
            }
            return response.json();
        })
        .then(activities => {
            console.log('Activities loaded:', activities);
            
            // Update activity table
            const activityTableBody = document.getElementById('activity-table-body');
            if (activityTableBody && activities.length > 0) {
                activityTableBody.innerHTML = '';
                
                activities.forEach(activity => {
                    const date = new Date(activity.date);
                    const formattedDate = date.toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', year: 'numeric'
                    });
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${formattedDate}</td>
                        <td>${activity.type}</td>
                        <td>${activity.duration} mins</td>
                        <td>${Math.round(activity.duration * 7.5)}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" data-id="${activity.id}">Edit</button>
                            <button class="btn btn-sm btn-outline-danger" data-id="${activity.id}">Delete</button>
                        </td>
                    `;
                    
                    activityTableBody.appendChild(row);
                });
                
                // Add event listeners for edit and delete buttons
                activityTableBody.querySelectorAll('.btn-outline-primary').forEach(btn => {
                    btn.addEventListener('click', () => {
                        alert(`Edit activity ${btn.dataset.id}`);
                    });
                });
                
                activityTableBody.querySelectorAll('.btn-outline-danger').forEach(btn => {
                    btn.addEventListener('click', () => {
                        if (confirm('Are you sure you want to delete this activity?')) {
                            deleteActivity(btn.dataset.id);
                        }
                    });
                });
            }
        })
        .catch(error => {
            console.error('Error fetching activities:', error);
        });
}

// Delete an activity
function deleteActivity(activityId) {
    fetch(`/api/activities/${activityId}?userId=default`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete activity');
        }
        return response.json();
    })
    .then(() => {
        // Refresh the activities list
        fetchActivities();
        // Also refresh dashboard data as it might include recent activities
        fetchDashboardData();
    })
    .catch(error => {
        console.error('Error deleting activity:', error);
        alert('Failed to delete activity. Please try again.');
    });
}

// Fetch goals
function fetchGoals() {
    fetch('/api/goals?userId=default')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch goals');
            }
            return response.json();
        })
        .then(goals => {
            console.log('Goals loaded:', goals);
            // In a real app, would update UI with the goals
        })
        .catch(error => {
            console.error('Error fetching goals:', error);
        });
}