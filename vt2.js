"use strict";
//@ts-check
// voit tutkia käsiteltävää xmldataa suoraan osoitteesta
// https://appro.mit.jyu.fi/cgi-bin/tiea2120/randomize.cgi
// xmldata muuttuu hieman jokaisella latauskerralla

// seuraava lataa datan ja luo sen käsittelyyn tarvittavan parserin
// xmldata-muuttuja sisältää kaiken tarvittavan datan

{
  let xmldata; 

  window.addEventListener("load", function() {
	fetch('https://appro.mit.jyu.fi/cgi-bin/tiea2120/randomize.cgi')
	  .then(response => response.text())
	  .then(function(data) {
		let parser = new window.DOMParser();
		xmldata = parser.parseFromString( data, "text/xml" );
		// tästä eteenpäin omaa koodia
		console.log(xmldata);
		console.log(xmldata.documentElement);
		console.log(xmldata.documentElement.getElementsByTagName("joukkue"));
		console.log(xmldata.documentElement.getElementsByTagName("sarja"));
		



// Funktio joka palauttaa järjestetyt tulokset listattuna sivulle


        let sarja = xmldata.documentElement.getElementsByTagName("sarja");

		let muokattava_joukkue = {};
		let lomake = document.forms[0];
		let lomake2 = document.forms[1];
		let fieldset = document.getElementById("jaseninputit");
		let alkuperainen_joukkue = muokattava_joukkue;
        // Luodaan sarjaobjekti johon tallennetaan sarjan id ja sitä vastaava nimi 
        let sarjaObj = {};
        for ( let child of sarja) {
			console.log(child.lastChild.textContent);
            sarjaObj[child.getAttribute("sarjaid")] = child.lastChild.textContent;
        }
		console.log(sarjaObj);	
        console.log(Object.keys(sarjaObj));

		joukkuelistaus();
function joukkuelistaus() {
	let tuloksetlista = document.getElementById("tuloksetlista");
	// Etsitään jokaisen joukkueen sarja ja tehdään sille viite sarjaobjektiin josta etsitään ideetä vastaava nimi
	let joukkueet = xmldata.documentElement.getElementsByTagName("joukkue");
	for ( let child of joukkueet) {
			
			let joukkueensarja = child.getAttribute("sarja");
			joukkueensarja = sarjaObj[child.getAttribute("sarja")];
	}

	// Järjestetään tulokset ensisijaisesti sarjan nimen mukaan aakkosjärjestyksessä
	// ja toissijaisesti joukkueen nimen mukaan
	// Isoilla ja pienillä kirjaimilla tai välilyönneillä ei väliä
	let jarjestetytTulokset = Array.from(xmldata.documentElement.getElementsByTagName("joukkue")).sort( (a, b) => {
			if (sarjaObj[a.getAttribute("sarja")] < sarjaObj[b.getAttribute("sarja")]) {return -1;}
			if (sarjaObj[a.getAttribute("sarja")] > sarjaObj[b.getAttribute("sarja")]) {return 1;}
			if (a.getElementsByTagName("nimi")[0].textContent.toLowerCase().trim() < b.getElementsByTagName("nimi")[0].textContent.toLowerCase().trim()) {return -1;}
			return 1;

	}
	);
	
	let caption = document.createElement("caption");
	caption.textContent = "Tulokset";
	tuloksetlista.appendChild(caption);
	let tr1 = document.createElement("tr");
	let th1 = document.createElement("th");
	let th2 = document.createElement("th");
	th1.textContent = "Sarja";
	th2.textContent = "Joukkue";
	tr1.appendChild(th1);
	tr1.appendChild(th2);
	tuloksetlista.appendChild(tr1);

	
	let i = 0;
	let joukkueYksi = jarjestetytTulokset[i];
	// Käydään silmukalla läpi kaikki järjestetyt tulokset joukkueet ja luodaan textnodet jokaisesta joukkueen
	// nimestä ja sarjaobjektista löytyvästä nimestä
	// Lisätään textnodet td elementteihin, td elementit tr elementtiin, tr elementti tuloksetlista table elementtiin. 
	for ( joukkueYksi of jarjestetytTulokset) {
		
		let jasenet = Array.from(joukkueYksi.getElementsByTagName("jasen"));
		console.log(jasenet);
		let jasen1 = "";
		for (let i = 0; i < jasenet.length; i++) {
			if (jasenet[i+1] === undefined) {
				jasen1 += jasenet[i].textContent;
			} else {
				jasen1 += jasenet[i].textContent;
				jasen1 += ", ";
			}
			
		}
		console.log(jasen1);
			
			let tr = document.createElement("tr");
			let td1 = document.createElement("td");
			let td2 = document.createElement("td");
			let ul = document.createElement("ul");
			
			let li1 = document.createElement("li");
			let a = document.createElement("a");
			a.href = "#lisayslomake";
			let li2 = document.createElement("li");
			let sarjanimi1 = document.createTextNode( sarjaObj[joukkueYksi.getAttribute("sarja")]);
			let joukkuenimi1 = document.createTextNode( joukkueYksi.getElementsByTagName("nimi")[0].textContent);
			let jasenetnimet = document.createTextNode(jasen1);
			td1.appendChild(sarjanimi1);
			td1.sarjanimi1 = sarjanimi1;
			a.appendChild(joukkuenimi1);
			li1.appendChild(a);
			// tallennetaan li-objektiin viite tietorakenteessa olevaan objektiin
			li1.joukkueYksi = joukkueYksi;
			joukkueYksi["tuloksetlista"] = {
				"nimi": joukkuenimi1.textContent,
				"sarja": sarjanimi1.textContent,
				"jasenet": jasenet
			};
			console.log(joukkueYksi["tuloksetlista"]);
			li1.addEventListener("click", muokkaa);
			li2.appendChild(jasenetnimet);
			li2.jasenetnimet = jasenetnimet;
			ul.appendChild(li1);
			ul.appendChild(li2);
			td2.appendChild(ul);
			tr.appendChild(td1);
			tr.appendChild(td2);
			tuloksetlista.appendChild(tr);
	}
}
        
        
console.log(lomake2["jnimi"]);
 function muokkaa(e) {

	let joukkue = e.currentTarget.joukkueYksi;
	console.log(joukkue);
	muokattava_joukkue = joukkue;
	console.log(muokattava_joukkue);
	alkuperainen_joukkue = joukkue;

	lomake2[`jnimi`].value = muokattava_joukkue.getElementsByTagName("nimi")[0].textContent;
	let muokattavan_sarja = muokattava_joukkue.getAttribute("sarja");
	console.log(muokattavan_sarja);
	let buttonit = document.getElementsByClassName("sarjabutton");
	console.log(buttonit[0].id);
	console.log(sarjaObj);
	for (let i = 0; i < buttonit.length; i++) {
		if (buttonit[i].id === muokattavan_sarja) {
			buttonit[i].checked = true;
		}
	}

	let muokattavanjasenet = muokattava_joukkue.getElementsByTagName("jasen");
	let muokattavan_jasenet_arr = [];

	for (let j of muokattavanjasenet) {
		
		muokattavan_jasenet_arr.push(j.textContent);
		
	}
	
	console.log(muokattavan_jasenet_arr);
	console.log(fieldset.children[0]);

	let i = 0;
	let jasennumero = 2;
	for (; i < muokattavan_jasenet_arr.length; i++) {
		let jasen = muokattavan_jasenet_arr[i];
		let input = fieldset.children[i];
		
		// Jos ei ole tarpeeksi jäsenien lisäys inputeja
		//tehdään lisää
		if ( !input ) {
			input = document.createElement("label");
			let inn = document.createElement("input");
			inn.type = "text";
			jasennumero += 1;
			jasennumero.toString();
			input.textContent = "Jasen ".concat(jasennumero);
			inn.value = "";
			inn.name = input.textContent;
			inn.id = input.textContent;
			inn.classList ="jasenet";
			input.appendChild(inn);
			fieldset.appendChild(input);
		}
		if ( jasen ) {
			// todo
			console.log(input.children[0]);
			input.children[0].value = jasen;
		}

		input.indeksi = i;
	}
	
 }


rastilistaus();


 let rastilista = document.getElementById("rastilista");
 //================================================
  
 
 // Funktio joka palauttaa jarjestetyn rastilistan ja tulostaa sen sivulle 
 function rastilistaus(jarjestetytRastit) {
		 let rastilista = document.getElementById("rastilista");
		 let rasti = xmldata.documentElement.getElementsByTagName("rasti");
		console.log(rasti);
		 // Järjestetään rastit aakkosjrjestykseen sort funktiolla
		 jarjestetytRastit = Array.from(xmldata.documentElement.getElementsByTagName("rasti")).sort( (a, b) => {
				 if (a.getAttribute("koodi") < b.getAttribute("koodi")) {return -1;}
				 if (a.getAttribute("koodi") > b.getAttribute("koodi")) {return 1;}
		 });
	  
		 let r = 0;
		 let rastinimiYksi = jarjestetytRastit[r];
		 // Silmukka käy kaikki rastit läpi uudesta jarjestetytRastit taulukosta ja 
		 //  luo textnoden jokaisen läpikäydyn rastin "koodi" atribuutista 
		 // ja lisää ne li elementtien sisään, sekä lopuksi kaikki li elementit sisällytetään "rastilista" ul-elementin sisään. 
		 for (rastinimiYksi of jarjestetytRastit) {
				 let li = document.createElement("li");
				 let rastinimet = document.createTextNode( rastinimiYksi.getAttribute("koodi") );
				 li.appendChild ( rastinimet );
				 li.rastinimet = rastinimet;
				 rastilista.appendChild(li);
				 }
 
				 return jarjestetytRastit;
 }


 function lisays(e) {

	// Estetään lomakkeen sisällön lähetys wwww-palvelimelle
	e.preventDefault();

	let rastit = xmldata.documentElement.firstChild;
	let rasti = rastit.childNodes;
	console.log(rasti);

	// Haetaan hmtl forms 
	let lisayslomake = document.forms[0].elements;

	// Määritellään jokainen formsin solu
	let latlaatikko = lisayslomake["Lat"];
	let lonlaatikko = lisayslomake["Lon"];
	let koodilaatikko = lisayslomake["Koodi"];


	// Määritellään se, että mikään input laatikoista ei saa olla tyhjänä, muuten lisäystä ei tehdä
	if (!koodilaatikko.value) {
			return false;
	}

	if (!latlaatikko.value && !isNaN(latlaatikko.value)) {
			return false;
	}


	if (!lonlaatikko.value && !isNaN(lonlaatikko.value)) {
			return false;
	}
	
	// Funktio käy kaikki ideet läpi, etsii suurimman ja 
	// lopuksi palauttaa suurimman+1 joka myöhemmin lisätään uuden rastin ideeksi
	function id(){
	
			let maxValue = rasti[0].getAttribute("tunniste");
			for (let child of rasti) {
				
			  if( child.getAttribute("tunniste") > maxValue ) { 
				maxValue = child.getAttribute("tunniste");
			}   
		  }  return maxValue+1;
		  }

		  // Luodaan uusi elementti "rasti", asetetaan sille tarvittu sisältö ja lisätään rasti rastit rakenteeseen
		  let uusirasti = xmldata.createElement("rasti");
		  uusirasti.setAttribute("tunniste", id());
		  uusirasti.setAttribute("koodi", koodilaatikko.value);
		  uusirasti.setAttribute("lat", latlaatikko.value);
		  uusirasti.setAttribute("lon", lonlaatikko.value);

		  rastit.appendChild(uusirasti);
		  console.log(uusirasti);

		


}


// Rastilisäys lomakkeen lähetä painikkeen EventListener
lomake.addEventListener("submit", function (e) {

	// Estetään lomakkeen lähettäminen palvelimelle
	e.preventDefault();
	
	// Kutsutaqn lisays(e) funktiota jotta se tehdään ensin
	lisays(e);
	// Tyhjätään rastilista elementti
	rastilista.textContent = "";
	// Lisätään rastilistaus uudestaan sisältäen lisätyn rastin
	rastilistaus();
	// Resetoidaan Rastilisäys lomake
	lomake.reset();


	
});

lomakebuttonit();

function lomakebuttonit() {

	let lisaysformi = document.forms[1].elements;
	console.log(lisaysformi);
	let fieldsetti = lisaysformi[2].parentNode;
	let jasenetfieldsetti = lisaysformi[2];
	let sarjat = xmldata.documentElement.getElementsByTagName("sarja");
	console.log(sarjat);
	let sarjatfield = document.createElement("fieldset");
	let sarjalegend = document.createElement("legend");
	let otsikko = document.createTextNode("Sarjat");
	sarjalegend.appendChild(otsikko);
	sarjalegend.otsikko = otsikko;
	sarjatfield.appendChild(sarjalegend);
  
	for (let sarja of sarjat) {

		console.log(sarja);

	  let p = document.createElement("p");
	  let labeli = document.createElement("label");
	  labeli.textContent = sarja.lastChild.textContent;
	  let radiobutton = document.createElement("input");
	  radiobutton.type = "radio";
	  radiobutton.name = "sarjat";
	  radiobutton.value = sarja.lastChild.textContent;
	  radiobutton.id = sarja.getAttribute("sarjaid");
	  radiobutton.className = "sarjabutton";
	  labeli.appendChild(radiobutton);
	  p.appendChild(labeli);
	  sarjatfield.appendChild(p);
	  fieldsetti.insertBefore(sarjatfield, jasenetfieldsetti);
	
	}

	let buttonit = document.getElementsByClassName("sarjabutton");
	buttonit[0].checked = true;


}



function joukkuelisays() {



  
	let lisayslomake = document.forms[0];
  
	let nimilaatikko = document.getElementById("jnimi"); 
	let valittusarja = lomake2.getElementsByClassName("sarjabutton");
  
	let valittusarjavalue;
	for (let i = 0; i < valittusarja.length; i++) {
	  if (valittusarja[i].checked) {
		valittusarjavalue = valittusarja[i].parentElement.textContent;
	  }
	}
  
   
  

  let jasenlaatikot = document.getElementsByClassName("jasenet");
  
  // Jos vain toinen on täytetty jäsenistä listään se stringinä, jos molemmat täytettyjä tehdään Array   
  function jasenlisays (jasenetjoukkueelle) {
	for (let i = 0; i < jasenlaatikot.length; i++) {
		if (jasenlaatikot.length === 2 && jasenlaatikot[0].value.length > 0 && jasenlaatikot[1].value.length === 0) {
			jasenetjoukkueelle = jasenlaatikot[0].value;
	} else if (jasenlaatikot.length === 2 && jasenlaatikot[0].value.length === 0 && jasenlaatikot[1].value.length > 0) {
		jasenetjoukkueelle = jasenlaatikot[1].value;
	} else {
		jasenetjoukkueelle = [];
		jasenetjoukkueelle.push(jasenlaatikot[i].value);
	}
   } 
   console.log(jasenetjoukkueelle);
  }
	// LIsättävä joukkue
	

	let uusijoukkue = xmldata.createElement("joukkue");
	uusijoukkue.setAttribute("aika", "00:00:00");
	uusijoukkue.setAttribute("matka", "0");
	uusijoukkue.setAttribute("sarja", sarjaObj[valittusarjavalue]);
	uusijoukkue.setAttribute("pisteet", "0");
	let rastileimaukset = xmldata.createElement("rastileimaukset");
	let leimaustapa = xmldata.createElement("leimaustavat");
	leimaustapa.setAttribute("leimaustapa", "1");
	let joukkuenimi = xmldata.createElement("nimi");
	joukkuenimi.textContent = nimilaatikko.value;
  	

	uusijoukkue.appendChild(rastileimaukset);
	uusijoukkue.appendChild(joukkuenimi);

	console.log(uusijoukkue);
	let rastit = xmldata.documentElement.firstChild;
	let joukkueet = xmldata.documentElement.lastChild;
	console.log(joukkueet);
	joukkueet.appendChild(uusijoukkue);
	console.log(uusijoukkue);
	return;
  
  
  }
  
  // ================================================================
  
  
  let jasennumero = 2;
  lomake2.addEventListener("change", function(e) {
	e.preventDefault();
	let jasenlaatikot = document.getElementsByClassName("jasenet");
	
	for (let i = 0; i < jasenlaatikot.length; i++) {
		
		if (i === jasenlaatikot.length-1 && jasenlaatikot[i].value.length > 0 && jasenlaatikot[i-1].value.length > 0) {
			let input = document.createElement("label");
			let inn = document.createElement("input");
			inn.type = "text";
			jasennumero += 1;
			jasennumero.toString();
			input.textContent = "Jäsen ".concat(jasennumero);
			inn.value = "";
			inn.name = input.textContent;
			inn.id = input.textContent;
			inn.classList ="jasenet";
			input.appendChild(inn);
			fieldset.appendChild(input);
		}
	}

	if (jasenlaatikot.length > 2) {
		for (let i = 2; i < jasenlaatikot.length; i++){
			if (i === jasenlaatikot.length-1 && jasenlaatikot[i].value.length === 0 && jasenlaatikot[i-1].value.length === 0) {
				jasennumero -= 1;
				jasenlaatikot[i].parentElement.remove();
			}
		}
		
	}
  });


  
  
  //Submit tapahtumankäsittelijä jossa myös poistetaan listaus ja lisätään se uudestaan uuden jäsenen kera
  lomake2.addEventListener("submit", function(e) {
	e.preventDefault();
	
	joukkuelisays();
  
	let tuloksetlista = document.getElementById("tuloksetlista");
	tuloksetlista.children.remove();
  
   joukkuelistaus();
  
	
	
  });
  
  
  // ================================================================
  
  let joukkueennimi = document.getElementById("lisayslomake").jnimi;
  let joukkueet = xmldata.documentElement.getElementsByTagName("joukkue");
  // Joukkueen nimen tarkistin
  joukkueennimi.addEventListener("input", function(e) {
	let joukkueennimi = e.target;
  
	joukkueennimi.setCustomValidity("");
  
	for (let joukkue of joukkueet) {
		
	  if (joukkueennimi.value.trim().toLowerCase() === joukkue.getElementsByTagName("nimi")[0].textContent.trim().toLowerCase() || !joukkueennimi.value.trim()) {
		joukkueennimi.setCustomValidity("Ei saman nimisiä tai tyhjää!");
	  } 
	}
  });
  
  
  let joukkueenjasen1 = document.getElementById("lisayslomake").Jasen1;
  let joukkueenjasen2 = document.getElementById("lisayslomake").Jasen2;
  joukkueenjasen1.addEventListener("input", function(e) {
	let joukkueenjasen1 = e.target;
  
	joukkueenjasen1.setCustomValidity("");
	if (!joukkueenjasen1.value.trim() && !joukkueenjasen2.value.trim()) {
	  joukkueenjasen1.setCustomValidity("JOMPI KUMPI PITÄÄ TÄYTTÄÄ!");
	}
  });
  
 //===============
 
	  }
	);

	

  });
 // voit määritellä omia funktioita tänne saman lohkon sisään jolloin näkevät myös xmldata-muuttujan
 // ...
 // ...
 // ...



 
}
