let states;
fetch("https://cdn-api.co-vin.in/api/v2/admin/location/states")
    .then(data => data.json())
    .then(data=>{
        states = data.states
    });

function getNextDate(today){
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    return (dd + '/' + mm + '/' + yyyy);
}

document.getElementById("submit-button").onclick = async () => {
    // clear old results
    let stateInput = document.getElementById("state-input").value;
    let districtInput = document.getElementById("district-input").value;
    let FoundState = states.find(state => state.state_name.toLowerCase() == stateInput.toLowerCase());
    if(!FoundState){
        alert("Invalid state");
        document.getElementById("state-input").value = "";
        document.getElementById("district-input").value = "";
        return
    }
    let stateID = FoundState.state_id;
    let districtList;
    await fetch(`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateID}`)
    .then(data => data.json())
    .then(data =>{
        districtList = data.districts;
    });
    let FoundDistrict = districtList.find(district => district.district_name.toLowerCase() == districtInput.toLowerCase());
    if(!FoundDistrict){
        alert("Invalid district");
        document.getElementById("state-input").value = "";
        document.getElementById("district-input").value = "";
        return
    }
    let today = new Date();
    let sessionsArray = [];
    for(let i=0;i<5;i++){
        let date = getNextDate(today);
        await fetch(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=${FoundDistrict.district_id}&date=${date}`)
                .then(data => data.json())
                .then(data => sessionsArray.push(data))
        today.setDate(today.getDate()+1);
    }
    if(!sessionsArray){
        alert("No Sessions Available");
        document.getElementById("state-input").value = "";
        document.getElementById("district-input").value = "";
        return
    }
    document.getElementsByClassName("main")[0].classList.add('hide');
    // creating results div 
    let resultsElement = document.createElement('div');
    resultsElement.classList.add('results');
    document.getElementsByTagName('body')[0].appendChild(resultsElement)
    sessionsArray.forEach(sessions => {
        sessions = sessions.sessions; // lmao
        if(!sessions.length) return
        let sessionDate = sessions[0].date;
        let dateElement = document.createElement('h3');
        dateElement.innerText = sessionDate;
        resultsElement.appendChild(dateElement);
        sessions.sort((a,b)=> b.available_capacity-a.available_capacity);
        sessions.forEach((session)=> {
            let sessionElement = document.createElement('p');
            let sessionInfo = document.createTextNode(`center : ${session.name}, pincode: ${session.pincode}, Age: ${session.min_age_limit}+, available : ${session.available_capacity}`)
            sessionElement.appendChild(sessionInfo);
            resultsElement.appendChild(sessionElement);
        })
    })  
}