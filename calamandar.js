const Calamandar = (function () {
  const root = document.querySelector(".cal-day");
  let height = 2; // em
  let startTime, endTime;
  let unit;

  function createColumn(label, isTimeColumn = false) {
    // create new column
    const column = document.createElement("div");
    column.classList.add("cal-column");
    if (isTimeColumn) column.classList.add("cal-time-column");

    // append title slot
    const title = document.createElement("h3");
    title.classList.add("cal-title");
    title.textContent = label;

    // add all to DOM
    column.appendChild(title);
    return column;
  }

  function createSection(ev, isTimeSlot = false) {
    const event_el = document.createElement("div");

    if (isTimeSlot) {
      event_el.classList.add("cal-time");
      event_el.textContent = ev["title"];
    } else {
      event_el.classList.add("cal-event");

      // set length
      const duration =
        moment(ev["end_time"]).diff(moment(ev["start_time"]), "minutes") / unit;
      event_el.style.height = `${height * duration}em`;

      // set title
      const title = document.createElement("p");
      title.classList.add("cal-event-title");
      title.textContent = ev["title"];
      event_el.appendChild(title);

      // append the details
      const details = document.createElement("p");
      details.classList.add("cal-event-details");
      details.textContent = ev["details"];
      event_el.appendChild(details);
    }

    return event_el;
  }

  function createSchedule(calData) {
    startTime = moment(calData["start_time"]);
    endTime = moment(calData["end_time"]);
    unit = calData["unit"]; // time slot units
    const columns = calData["columns"]; // list of schedule columns

    // create time column
    const time_column_el = createColumn("Time", startTime, endTime, true);
    root.appendChild(time_column_el);

    // add time slots
    let currTime = startTime.clone();
    while (currTime.isBefore(endTime)) {
      time_column_el.appendChild(
        createSection(
          {
            title: currTime.format("HH:mm"),
          },
          true
        )
      );
      currTime.add(unit, "m");
    }

    // create columns and add sections
    for (column in columns) {
      const column_el = createColumn(column);
      root.appendChild(column_el);
      // loop over column section data and append to column
      let currTime = startTime.clone();
      columns[column].forEach((ev) => {
        // append margin
        let marginSize = 0;
        while (currTime.isBefore(ev["start_time"])) {
          marginSize += height;
          currTime.add(unit, "m");
        }
        const section = createSection(ev);
        section.style.marginTop = `${marginSize}em`;
        // append section
        column_el.appendChild(section);
        currTime = moment(ev["end_time"]);
      });
    }
  }

  return function (data) {
    createSchedule(data);
  };
})();

// fetch calamandar data and call createSchedule to generate the calandar!

const req = new XMLHttpRequest();
req.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    const res = JSON.parse(req.response);
    Calamandar(res);
  }
};
req.open("GET", "/calamandar_data.json");
req.send();
