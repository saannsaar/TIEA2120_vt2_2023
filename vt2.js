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
		

		let tallennusbuttoni = document.getElementById("tallennusbutton");

// Funktio joka palauttaa järjestetyt tulokset listattuna sivulle


        let sarja = xmldata.documentElement.getElementsByTagName("sarja");
		let jarjestetytSarjat = Array.from(sarja).sort(function(a,b) {
			if (a.lastChild.textContent < b.lastChild.textContent) {return -1;}
			if (a.lastChild.textContent > b.lastChild.textContent) {return 1;}
			return 0;
			});
		console.log(jarjestetytSarjat[0].lastChild.textContent);
		let muokattava_joukkue = {};
		let lomake = document.forms[0];
		let lomake2 = document.forms[1];
		let fieldset = document.getElementById("jaseninputit");
		let alkuperainen_joukkue = muokattava_joukkue;
        // Luodaan sarjaobjekti johon tallennetaan sarjan id ja sitä vastaava nimi 
        let sarjaObj = {};
        for ( let child of jarjestetytSarjat) {
			console.log(child.lastChild.textContent);
            sarjaObj[child.lastChild.textContent ] = child.getAttribute("sarjaid");
        }
		console.log(sarjaObj);	

		
  
		
		joukkuelistaus();
	function joukkuelistaus() {
	let tuloksetlista = document.getElementById("tuloksetlista");

	let joukkueet = xmldata.documentElement.getElementsByTagName("joukkue");
	
	// Järjestetään tulokset ensisijaisesti sarjan nimen mukaan aakkosjärjestyksessä
	// ja toissijaisesti joukkueen nimen mukaan
	// Isoilla ja pienillä kirjaimilla tai välilyönneillä ei väliä
	let jarjestetytTulokset = Array.from(xmldata.documentElement.getElementsByTagName("joukkue")).sort( (a, b) => {
			if (Object.keys(sarjaObj).find(key => sarjaObj[key] === a.getAttribute("sarja")) < Object.keys(sarjaObj).find(key => sarjaObj[key] === b.getAttribute("sarja"))) {return -1;}
			if (Object.keys(sarjaObj).find(key => sarjaObj[key] === a.getAttribute("sarja")) > Object.keys(sarjaObj).find(key => sarjaObj[key] === b.getAttribute("sarja"))) {return 1;}
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
		let sarjakey = Object.keys(sarjaObj).find(key => sarjaObj[key] === joukkueYksi.getAttribute("sarja"));
		console.log(sarjakey);
		let jasen1 = "";
		for (let i = 0; i < jasenet.length; i++) {
			if (jasenet[i+1] === undefined) {
				jasen1 += jasenet[i].textContent;
			} else {
				jasen1 += jasenet[i].textContent;
				jasen1 += ", ";
			}
			
		}
		
			
			let tr = document.createElement("tr");
			let td1 = document.createElement("td");
			let td2 = document.createElement("td");
			let ul = document.createElement("ul");
			
			let li1 = document.createElement("li");
			let a = document.createElement("a");
			a.href = "#lisayslomake";
			let li2 = document.createElement("li");
			let sarjanimi1 = document.createTextNode(sarjakey);
			let joukkuenimi1 = document.createTextNode( joukkueYksi.getElementsByTagName("nimi")[0].textContent);
			let jasenetnimet = document.createTextNode(jasen1);
			td1.appendChild(sarjanimi1);
			td1.sarjanimi1 = sarjanimi1;
			a.appendChild(joukkuenimi1);
			li1.appendChild(a);
			// tallennetaan li-objektiin viite tietorakenteessa olevaan objektiin
			
			
			li1.addEventListener("click", muokkaa);
			li2.appendChild(jasenetnimet);
			li2.jasenetnimet = jasenetnimet;
			ul.appendChild(li1);
			ul.appendChild(li2);
			td2.appendChild(ul);
			tr.appendChild(td1);
			li1.joukkueYksi = joukkueYksi;
			joukkueYksi["tuloksetlista"] = {
				"nimi": joukkuenimi1.textContent,
				"sarja": sarjanimi1.textContent,
				"jasenet": jasenet
			};
			tr.appendChild(td2);

			tuloksetlista.appendChild(tr);
	}
}
        
        
console.log(lomake2["jnimi"]);

let muokkausbutton = document.getElementById("muokkausbutton");
	console.log(muokkausbutton);
	

// MUOKATAAN JOUKKUETTA
 function muokkaa(e) {
	tallennusbuttoni.value ="Tallenna muutokset";
	
	let joukkue = e.currentTarget.joukkueYksi;

	console.log(joukkue, "HEI");
	muokattava_joukkue = joukkue;
	console.log(muokattava_joukkue["tuloksetlista"]["nimi"]);
	
	muokattava_joukkue["nimi"] = joukkue["nimi"];
  muokattava_joukkue["sarja"] = joukkue["sarja"];
  muokattava_joukkue["jasenet"] = joukkue["jasenet"];

  alkuperainen_joukkue = joukkue;
	lomake2[`jnimi`].value = muokattava_joukkue["tuloksetlista"]["nimi"];

	console.log(muokattava_joukkue["tuloksetlista"]["sarja"]);

	let buttonit = document.getElementsByClassName("sarjabutton");
	
	for (let i = 0; i < buttonit.length; i++) {
		if (buttonit[i].value == muokattava_joukkue["tuloksetlista"]["sarja"]) {
     
      console.log(muokattava_joukkue["tuloksetlista"]["sarja"]);
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

 let joukkueennimi = document.getElementById("jnimi");

 joukkueennimi.addEventListener("input", function(e) {
	console.log("TOIMII", joukkueennimi);
	let joukkueennimii = e.target;
	joukkueennimii.setCustomValidity("");
	if (tallennusbuttoni.value == "Tallenna muutokset") {
		muokattava_joukkue["tuloksetlista"]["nimi"] = e.target.value;
		console.log(muokattava_joukkue["tuloksetlista"]["nimi"]);
	} else if (tallennusbuttoni.value =="Lisää joukkue") {
		
		joukkueennimii.setCustomValidity("");

		for (let joukkue of xmldata.documentElement.getElementsByTagName("joukkue")) {
		  if (e.target.value.trim().toLowerCase() === joukkue.getElementsByTagName("nimi")[0].textContent.trim().toLowerCase() || !e.target.value.trim()) {
			joukkueennimii.setCustomValidity("Ei saman nimisiä tai tyhjää!");
		  } 
	}}
 });

rastilistaus();


 let rastilista = document.getElementById("rastilista");
 //================================================
  
 
 // Funktio joka palauttaa jarjestetyn rastilistan ja tulostaa sen sivulle 
 function rastilistaus(jarjestetytRastit) {
		 let rastilista = document.getElementById("rastilista");
		 console.log(rastilista);
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
	rastibuttonit();


	
});


// LOMAKEBUTTONIT

rastibuttonit();
function rastibuttonit() {
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

	let sortedsarjaObj = Object.entries(sarjaObj).sort(([,a],[,b]) => b-a);
	console.log(sortedsarjaObj);
	
	for (let sarja in sarjaObj) {

		console.log(sarja);
		console.log(sarjaObj[sarja]);

	  let p = document.createElement("p");
	  let labeli = document.createElement("label");
	  labeli.textContent = sarja;
	  let radiobutton = document.createElement("input");
	  radiobutton.type = "radio";
	  radiobutton.name = "sarjat";
	  radiobutton.value = sarja;
	  radiobutton.id = sarjaObj[sarja];
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
		console.log(valittusarja[i].parentElement.textContent);
		valittusarjavalue = valittusarja[i].parentElement.textContent;
	  }
	}
	console.log(valittusarjavalue);
	console.log(sarjaObj);
   console.log(sarjaObj["1286437"]);

   let sarjakey = Object.keys(sarjaObj).find(key => sarjaObj[key] === valittusarjavalue);
		console.log(sarjakey);
  

  let jasenlaatikot = document.getElementsByClassName("jasenet");
  
  // Jos vain toinen on täytetty jäsenistä listään se stringinä, jos molemmat täytettyjä tehdään Array   
 let jasenetjoukkueelle = [];
	 
		
for (let i = 0; i < jasenlaatikot.length; i++) {
	if (jasenlaatikot[i].value === "") {
		continue;
	}else {
		jasenetjoukkueelle.push(jasenlaatikot[i].value);
	}
}
		


	

   console.log(jasenetjoukkueelle);
  
	// LIsättävä joukkue

	let jasenetelement = xmldata.createElement("jasenet");

	for (let j of jasenetjoukkueelle) {
		let jasenelement = xmldata.createElement("jasen");
		jasenelement.textContent = j;
		jasenetelement.appendChild(jasenelement);
	}

	let uusijoukkue = xmldata.createElement("joukkue");
	uusijoukkue.setAttribute("aika", "00:00:00");
	uusijoukkue.setAttribute("matka", "0");
	uusijoukkue.setAttribute("sarja", sarjaObj[valittusarjavalue]);
	uusijoukkue.setAttribute("pisteet", "0");
	let rastileimaukset = xmldata.createElement("rastileimaukset");
	let leimaustavat = xmldata.createElement("leimaustapa");
  	let leimaustapa = xmldata.createElement("leimaustapa");
	leimaustapa.textContent = "1";
	let joukkuenimi = xmldata.createElement("nimi");
	joukkuenimi.textContent = nimilaatikko.value;
  	
  leimaustavat.appendChild(leimaustapa);
	uusijoukkue.appendChild(rastileimaukset);
	uusijoukkue.appendChild(joukkuenimi);
	uusijoukkue.appendChild(leimaustavat);
	uusijoukkue.appendChild(jasenetelement);

	console.log(uusijoukkue);
	let rastit = xmldata.documentElement.firstChild;
	let joukkueet = xmldata.documentElement.lastChild;
	console.log(joukkueet);
	joukkueet.appendChild(uusijoukkue);
	console.log(uusijoukkue);
	return;
  
  
  }
  
  // ================================================================
  
  
  

  let jaseninputit = document.getElementsByClassName("jasenet");
  jaseninputit[1].addEventListener("input", lisaaJasenInput);


    function lisaaJasenInput(e) {
        // käydään läpi kaikki input-kentät viimeisestä ensimmäiseen
        // järjestys on oltava tämä, koska kenttiä mahdollisesti poistetaan
        // ja poistaminen sotkee dynaamisen nodeList-objektin indeksoinnin
        // ellei poisteta lopusta 
        let viimeinen_tyhja = -1; // viimeisen tyhjän kentän paikka listassa
        for(let i=jaseninputit.length-1 ; i>-1; i--) { // inputit näkyy ulommasta funktiosta
            let input = jaseninputit[i];
            
            if ( viimeinen_tyhja > -1 && input.value.trim() == "") { // ei kelpuuteta pelkkiä välilyöntejä
                let poistettava = jaseninputit[viimeinen_tyhja].parentNode; // parentNode on label, joka sisältää inputin
                fieldset.removeChild( poistettava );
                viimeinen_tyhja = i;
            }
            // ei ole vielä löydetty yhtään tyhjää joten otetaan ensimmäinen tyhjä talteen
            if ( viimeinen_tyhja == -1 && input.value.trim() == "") {
                    viimeinen_tyhja = i;
            }
        }
        // ei ollut tyhjiä kenttiä joten lisätään yksi
        if ( viimeinen_tyhja == -1) {
            let label = document.createElement("label");
            label.textContent = "Jäsen";
            let input = document.createElement("input");
            input.setAttribute("type", "text");
			input.classList = "jasenet";
            input.addEventListener("input", lisaaJasenInput);
            fieldset.appendChild(label).appendChild(input);
        }
        // jos halutaan kenttiin numerointi
        for(let i=0; i<jaseninputit.length; i++) { // inputit näkyy ulommasta funktiosta
                let label = jaseninputit[i].parentNode;
                label.firstChild.nodeValue = "Jäsen " + (i+1); // päivitetään labelin ekan lapsen eli tekstin sisältö
        }
    
    }




  
  //Submit tapahtumankäsittelijä jossa myös poistetaan listaus ja lisätään se uudestaan uuden jäsenen kera
  lomake2.addEventListener("submit", function(e) {

	if (tallennusbuttoni.value ="Lisää joukkue") {
		e.preventDefault();
	
	joukkuelisays();
  
	let tuloksetlista = document.getElementById("tuloksetlista");
	tuloksetlista.textContent = "";
  
   joukkuelistaus();

   lomake2.reset();
   let jasenlaatikot = document.getElementsByClassName("jasenet");

   if (jasenlaatikot.length > 2) {
	for (let i = 2; i < jasenlaatikot.length; i++){
		if (i === jasenlaatikot.length-1 && jasenlaatikot[i].value.length === 0 && jasenlaatikot[i-1].value.length === 0) {
			jasenlaatikot[i].parentElement.remove();
		} 
	} }


   let buttonit = document.getElementsByClassName("sarjabutton");
	buttonit[0].checked = true;
  

	} else if (tallennusbuttoni.value ="Tallenna muutokset") {
		e.preventDefault();

		let valittusarja = lomake.getElementsByClassName("sarjabutton");
		// ====================// ====================
		  let valittusarjavalue;
		  for (let i = 0; i < valittusarja.length; i++) {
			if (valittusarja[i].checked) {
			  valittusarjavalue = valittusarja[i].parentElement.textContent;
			}
		  }
	}
	
	
  });


  lomake2.addEventListener("change", function(e) {

    let arr = document.getElementsByClassName("jasenet");
  for( let j = 0; j < arr.length; j++) {
    arr[0].setCustomValidity("");
    if (arr[0].value.length == 0 && arr[1].value.length == 0 ) {
      arr[0].setCustomValidity("Joukkueella täytyy olla edes yksi jäsen");
    } else {
      arr[0].setCustomValidity("");
    }
  }
  });
  
  // RASTILOMAKKEELLE
  let koodiinput = document.getElementById("rastilisaus").Koodi;
  let rastit = xmldata.documentElement.getElementsByTagName("rasti");
  koodiinput.addEventListener("input", function(e) {
	let koodiinput = e.target;
	koodiinput.setCustomValidity("");

	for (let rasti of rastit) {
		if (koodiinput.value.trim().toLowerCase() === rasti.getAttribute("koodi").trim().toLowerCase()) {
			koodiinput.setCustomValidity("Ei saman nimisiä rasteja!");
		}
	}
  });
  
  // ================================================================

  let joukkueet = xmldata.documentElement.getElementsByTagName("joukkue");
 
  
  
  
 //===============
 
	  }
	);

	

  });
 // voit määritellä omia funktioita tänne saman lohkon sisään jolloin näkevät myös xmldata-muuttujan
 // ...
 // ...
 // ...



 
}
