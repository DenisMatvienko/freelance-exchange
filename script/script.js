document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    
    const customer = document.getElementById('customer');
    const freelancer = document.getElementById('freelancer');
    const blockCustomer = document.getElementById('block-customer');
    const blockFreelancer = document.getElementById('block-freelancer');
    const blockChoice = document.getElementById('block-choice');
    const btnExit = document.getElementById('btn-exit');
    const formCustomer = document.getElementById('form-customer');
    const ordersTable = document.getElementById('orders');
    const modalOrder = document.getElementById('order_read');
    const modalOrderActive = document.getElementById('order_active');
    
    //localStorage.clear() - очистить все заказы во фрилансере

    const orders = JSON.parse(localStorage.getItem('freeOrders')) || []; //получаемый массив, распарсиваем его, сохраныяем в массив orders

    const toStorage = () => {
        localStorage.setItem('freeOrders', JSON.stringify(orders));
    };

    const declOfNum = (number, titles) => number + ' ' + titles[(number % 100 > 4 && number % 100 < 20) ?
         2 : [2, 0, 1, 1, 1, 2][(number % 10 < 5) ? number % 10 : 5]];                      //тернарный оператор, склонения

    

    const calcDeadline = (data) => {
        const deadline = new Date(data); //назначаем время по Москве, для дедлайна
        const toDay = Date.now();
        
        
        const ramaining = (deadline - toDay) / 1000 / 60 / 60 / 24; //получаем милисекунды / на 1000 получаем минуты (в итоге получаем количество часов и дней из милисекунд)
        
        if (ramaining / 24 > 2) {
            return declOfNum(Math.floor(ramaining / 24), ['день', 'дня', 'дней']) // округляем + склонения, если не получается дней то часов
        }
        
        return declOfNum(Math.floor(ramaining), ['час', 'часа', 'часов']) 
    }


    const renderOrders = () => {

        ordersTable.textContent = '';

        orders.forEach((order, i) => { // нужно выводить номер заказа для отображения в "фрилансере" - передаем в таблицу из массива

            ordersTable.innerHTML += `
                <tr class="order ${order.active ? 'taken': ''}"
                    data-number-order="${i}">
                    <td>${i+1}</td>
                    <td>${order.title}</td>
                    <td class="${order.currency}"></td>
                    <td>${calcDeadline(order.deadline)}</td>
                </tr> `; // первый столбец увеличивается, во второй добавляется выбранная в форме заказ, в 3 оплата, в 4 срок из формы

        }); 
    };

    const handlerModal = () => {
        const target = event.target;

        const modal = target.closest('.order-modal');
        const order = orders[modal.id];

        const baseAction = () => {
            modal.style.display = 'none';
            toStorage();                    //из local storage берем массив для записи во вкладку "фрилансер"
            renderOrders();
        }

        if (target.closest('.close') || target == modal) {          //закрывается при нажатии на крестик или мимо окна
            modal.style.display = 'none';
        }

        if (target.classList.contains('get-order')) {
            order.active = true;
            baseAction();

        }

        if (target.id === 'capitulation') {
            order.active = false;
            baseAction();
        }

        if (target.id === 'ready') {
            orders.splice(orders.indexOf(order), 1);
            baseAction();
        }
    };

    // const target;
    // if (order.active){
    //     target = modalOrderActive
    // } else {
    //     target = modalOrder
    // }

    const openModal = (numberOrder) => {
        const order = orders[numberOrder];

        
        const { title, firstName, email, phone, description, amount,
             currency, deadline, active = false } = order;

        const modal = order.active ? modalOrderActive : modalOrder; //тоже самое что и коммент выше const target

        const firstNameBlock = modal.querySelector('.firstName'),
            TitleBlock = modal.querySelector('.modal-title'),
            emailBlock = modal.querySelector('.email'),
            descriptionBlock = modal.querySelector('.description'),
            deadlineBlock = modal.querySelector('.deadline'),
            currencyBlock = modal.querySelector('.currency_img'),
            countBlock = modal.querySelector('.count'),
            phoneBlock = modal.querySelector('.phone');

        modal.id = numberOrder;

        TitleBlock.textContent = title; // появляется заголовок в окне из введеного текста пользователем о заголовке (добавлен только заголовок!!!! так же добавить эмеил, телефон, связаться и описание, в переменных выше, в этой же функции они объявлены)
            
        firstNameBlock.textContent =  firstName;
        emailBlock.textContent = email;
        emailBlock.href = 'mailto:' + email;
        descriptionBlock.textContent = description;
        deadlineBlock.textContent = calcDeadline(deadline);
        currencyBlock.className = ('currency_img');
        currencyBlock.classList.add('currency');
        countBlock.textContent = amount;
        phoneBlock ? phoneBlock.href = 'tel:' + phone : '';

        modal.style.display = 'flex';

        modal.addEventListener('click', handlerModal);
    };

    ordersTable.addEventListener('click', (event) => {
        const target = event.target;

        const targetOrder = target.closest('.order')
        if (targetOrder) {
            openModal(targetOrder.dataset.numberOrder);
        }
    });

    customer.addEventListener('click', () => {      // открываем форму с клиентом/заказчиком
        blockChoice.style.display = 'none';
        const toDay = new Date().toISOString().substring(0, 10); //берем дату делаем ее методом исо через тире, и обрезаем дату от 0 эл-та до 10
        document.getElementById('deadline').min = toDay // не даем взять дату раньше настоящего времени
        blockCustomer.style.display = 'block';
        btnExit.style.display = 'block';
    });


    freelancer.addEventListener('click', () => {    // открываем форму с фрилансером
        blockChoice.style.display = 'none';
        renderOrders();
        blockFreelancer.style.display = 'block';
        btnExit.style.display = 'block';
    });

    btnExit.addEventListener('click', () => {   // кнопка выхода выходит из "заказчика" и "фрилансера"
        btnExit.style.display = 'none';
        blockFreelancer.style.display = 'none';
        blockCustomer.style.display = 'none';
        blockChoice.style.display = 'block';
    });

    formCustomer.addEventListener('submit', (e) => {  //не перезагружается форма при нажатии кнопки отправить форму
        e.preventDefault(); // не будет обновлять страницу с ним

        const obj = {}; //сформировывается объект

        const elements = [...formCustomer.elements]
            .filter((elem) => (elem.tagName === 'INPUT' && elem.type !== 'radio') ||
                (elem.type === 'radio' && elem.checked) ||
                elem.tagName === 'TEXTAREA');

        elements.forEach((elem) => {   //когда цикл  начинается все отдает в обЪект (в этом цикле получаем все из формы в консоль (все что ввел пользователь))
                obj[elem.name] = elem.value;


        });
        
        formCustomer.reset();  // после отправки оставит те значения в форме, которые мы указывали изнаально

        orders.push(obj); //то что мы получили из цикла (о всех данных пользователя введеными им в форму) отправляются в orders, формируются массив из данных которые отправляют пользователи
        toStorage();
    });

    



});