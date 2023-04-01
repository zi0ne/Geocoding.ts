import axios from "axios"; // axios import
// module에 axios, index.d.ts 를 보면 이미 라이브러리를 ts 변환 패키지와 번들링한 것을 확인할 수 있음.

const form = document.querySelector('form')!; 
// form 태그를 사용하는 양식을 가져오기(주소 입력 데이터), null 값이 아닌 어떤 값이 들어올 것 이라고 ts전달
const addressInput = document.getElementById('address')! as HTMLInputElement;
// 태그형식이 아닌 id로 가져오기 때문에 getElementById 
// addressInput.value 값이 실제 존재한다는 것을 ts가 모르기 때문에 타입캐스팅(as)를 사용하여 html 요소로 변환시킴

const GOOGLE_API_KEY = 'API_KEY';
// 구글 API

declare var google: any; // google은 전역적으로 가져왔기 때문에 존재하는 값이라는 것을 ts에게 알려줌

type GoogleGeocodingResponse ={
    results: {geometry:{location: { lat:number, lng: number}}}[];
    status: 'OK' | 'ZERO_RESULTS';
}; // 아래(axios)에서 location의 값을 얻을 때 응답으로 원하는 type을 지정한 것.
    // data에 status의 정보 또한 넣을 수 있음

// submit으로 양식이 제출될 때마다 작동할 함수
function searchAddressHandler(event:Event){
    event.preventDefault();
    // ts에게 이벤트라고 알려 preventDefault 명령어가 존재함을 알림.
    // 양식이 제출되어 요청이 전송되는 것을 방지함.  
    
    const enteredAddress = addressInput.value;
    // 주소의 값을 얻기 (쉼표, 다시 와 같은 문자 와 기호가 있을 수 있음)
    
    //구글 API로 보내기 (geocoding API 사용 >> 주소를 좌표로 변환, 좌표를 주소로 변환)
    // address를 enteredAddress로 바꿔 받아올 주소 넣기 (주소가 기호가 섞여있어, 원하는 양식이 아닐 수 있다 >> 이를 해결 encodeURI(), API가 원하는 주소양식에 맞게 바꿔줌)
    axios
    .get<GoogleGeocodingResponse>(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(enteredAddress)}&key=${GOOGLE_API_KEY}`)
    // 잘 요청되어서 받아올 경우
    .then(response =>{
        if(response.data.status !== 'OK') {
            throw new Error('Could not fetch location!');
        } // 연결이 올바르게 되지 않았다면, 에러메세지 띄우기
        const coordinates = response.data.results[0].geometry.location;
        // 받아 온 데이터의 data > results > [0] > geometry > location 에 원하는 정보가 있음
        const map = new google.maps.Map(document.getElementById('map'), {
            center: coordinates,
            zoom: 8
          });

        new google.maps.Marker({positoin: coordinates, map:map}); // 검색 위치 마커 찍기
    })
    // 에러가 날 경우
    .catch(err =>{
        alert(err.message);
        console.log(err);
    })
}

form.addEventListener('submit', searchAddressHandler);