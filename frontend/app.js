document.addEventListener('DOMContentLoaded', () => {
    const targetDateInput = document.getElementById('targetDate');
    const modeDaysBtn = document.getElementById('modeDays');
    const modeWeeksBtn = document.getElementById('modeWeeks');
    const modeSpecificBtn = document.getElementById('modeSpecific');
    const daySelectorContainer = document.getElementById('daySelectorContainer');
    const specificDaySelect = document.getElementById('specificDaySelect');
    const countValue = document.getElementById('countValue');

    let currentMode = 'days'; // default

    // Load from cookies
    const loadState = () => {
        const cookies = document.cookie.split('; ');
        const dateCookie = cookies.find(row => row.startsWith('targetDate='));
        const modeCookie = cookies.find(row => row.startsWith('mode='));
        const dayCookie = cookies.find(row => row.startsWith('specificDay='));

        if (dateCookie) {
            targetDateInput.value = dateCookie.split('=')[1];
        } else {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            targetDateInput.value = tomorrow.toISOString().split('T')[0];
        }

        if (modeCookie) {
            currentMode = modeCookie.split('=')[1];
        }

        if (dayCookie) {
            specificDaySelect.value = dayCookie.split('=')[1];
        }

        updateModeUI();
    };

    const saveState = () => {
        const date = targetDateInput.value;
        const selectedDay = specificDaySelect.value;
        document.cookie = `targetDate=${date}; max-age=31536000; path=/`;
        document.cookie = `mode=${currentMode}; max-age=31536000; path=/`;
        document.cookie = `specificDay=${selectedDay}; max-age=31536000; path=/`;
    };

    const updateModeUI = () => {
        [modeDaysBtn, modeWeeksBtn, modeSpecificBtn].forEach(btn => btn.classList.remove('active'));
        
        if (currentMode === 'days') {
            modeDaysBtn.classList.add('active');
            daySelectorContainer.classList.add('hidden');
        } else if (currentMode === 'weeks') {
            modeWeeksBtn.classList.add('active');
            daySelectorContainer.classList.add('hidden');
        } else if (currentMode === 'specific') {
            modeSpecificBtn.classList.add('active');
            daySelectorContainer.classList.remove('hidden');
        }
    };

    const calculate = async () => {
        const date2 = targetDateInput.value;
        if (!date2) return;

        const date1 = new Date().toISOString().split('T')[0];
        let endpoint = 'days_between';
        let params = `date1=${date1}&date2=${date2}`;

        if (currentMode === 'weeks') {
            endpoint = 'weeks_between';
        } else if (currentMode === 'specific') {
            endpoint = 'specific_day_between';
            params += `&specific_day=${specificDaySelect.value}`;
        }
        
        try {
            const response = await fetch(`/${endpoint}?${params}`);
            const data = await response.json();
            
            let result;
            if (currentMode === 'days') result = data.days_between;
            else if (currentMode === 'weeks') result = data.weeks_between;
            else result = data.specific_day_count;
            
            typeWriterEffect(result.toString());
            saveState();
        } catch (error) {
            console.error('Fetch error:', error);
            countValue.innerText = 'ERR';
        }
    };

    const typeWriterEffect = (text) => {
        countValue.innerText = '';
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                countValue.innerText += text.charAt(i);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 50);
    };

    targetDateInput.addEventListener('change', calculate);
    specificDaySelect.addEventListener('change', calculate);

    modeDaysBtn.addEventListener('click', () => {
        currentMode = 'days';
        updateModeUI();
        calculate();
    });

    modeWeeksBtn.addEventListener('click', () => {
        currentMode = 'weeks';
        updateModeUI();
        calculate();
    });

    modeSpecificBtn.addEventListener('click', () => {
        currentMode = 'specific';
        updateModeUI();
        calculate();
    });

    // Initial load
    loadState();
    calculate();
});
