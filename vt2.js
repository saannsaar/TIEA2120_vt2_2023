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

		let tallennusbuttoni = document.getElementById("tallennusbutton");

		
		let sortOrder = "";

		// Järjestetään sarjat nousevaan järjestykseen
        let sarja = xmldata.documentElement.getElementsByTagName("sarja");
		let jarjestetytSarjat = Array.from(sarja).sort(function(a,b) {
			if (a.lastChild.textContent < b.lastChild.textContent) {return -1;}
			if (a.lastChild.textContent > b.lastChild.textContent) {return 1;}
			return 0;
			});
		
		
		let muokattava_joukkue = {};
		let lomake = document.forms[1];
		let lomake2 = document.forms[0];
		
		let fieldset = document.getElementById("jaseninputit");
		let alkuperainen_joukkue = muokattava_joukkue;

        // Luodaan sarjaobjekti johon tallennetaan sarjan id ja sitä vastaava nimi 
        let sarjaObj = {};
        for ( let child of jarjestetytSarjat) {
			console.log(child.lastChild.textContent);
            sarjaObj[child.lastChild.textContent ] = child.getAttribute("sarjaid");
        }
		let leimauksetXml = Array.from(xmldata.getElementsByTagName("leimaustavat")[0].children);
		console.log(leimauksetXml);
		
		// Luodaan leimausobjekti johon tallennetaan leimaustavan nimi ja indeksi
		let leimausObj = {};
		for (let i = 0; i < leimauksetXml.length; i++) {
			console.log(i, leimauksetXml[i].textContent);
			leimausObj[i] = leimauksetXml[i].textContent;
		}

		
		
		console.log(leimausObj);

		
		let tuloksetlista = document.getElementById("tuloksetlista");
		
		joukkuelistaus();
		alkusorttaus();

	// Joukkuelistausfunktio
	function joukkuelistaus() {
	
		let rastitXml = Array.from(xmldata.getElementsByTagName("rasti"));
		// Tehdään rastiobjekti johon tallennetaan tunniste ja rastin koodi,
		// jotta voidaan löytää oikeat rastikoodit joukkueen 
		// rastileimauksista objektin avulla
		let rastiObj = {};
		for (let i = 0; i < rastitXml.length; i++) {
			rastiObj[rastitXml[i].getAttribute("tunniste")] = rastitXml[i].getAttribute("koodi");
		}
		console.log(rastiObj);

	let joukkueet = xmldata.documentElement.getElementsByTagName("joukkue");
	
	// Joukkuerakenne
	let jarjestetytTulokset = Array.from(xmldata.documentElement.getElementsByTagName("joukkue"));

	
	
	let caption = document.createElement("caption");
	caption.textContent = "Tulokset";
	tuloksetlista.appendChild(caption);
	let tr1 = document.createElement("tr");
	let th1 = document.createElement("th");
	let th2 = document.createElement("th");
	let th3 = document.createElement("th");
	let th4 = document.createElement("th");
	th3.textContent ="Leimaustapa";
	th1.textContent = "Sarja";
	th1.addEventListener("click", sarjasort);
	th2.textContent = "Joukkue";
	th2.addEventListener("click", joukkuesort);
	th4.textContent = "Pisteet";
	th4.addEventListener("click", pistesort);
	tr1.appendChild(th1);
	tr1.appendChild(th2);
	tr1.appendChild(th3);
	tr1.appendChild(th4);
	tuloksetlista.appendChild(tr1);


	let rastit = Array.from(xmldata.getElementsByTagName("rasti"));

	//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	
	let i = 0;
	let joukkueYksi = jarjestetytTulokset[i];
	// Käydään silmukalla läpi kaikki järjestetyt tulokset joukkueet ja luodaan textnodet jokaisesta joukkueen
	// nimestä ja sarjaobjektista löytyvästä nimestä
	// Lisätään textnodet td elementteihin, td elementit tr elementtiin, tr elementti tuloksetlista table elementtiin. 
	for ( joukkueYksi of jarjestetytTulokset) {

		
		//::::::::::::::::::::::::::::::::::::::::::::::
		
		let jasenet = Array.from(joukkueYksi.getElementsByTagName("jasen"));
		let sarjakey = Object.keys(sarjaObj).find(key => sarjaObj[key] === joukkueYksi.getAttribute("sarja"));
		
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
			//Sarjalle td
			let td1 = document.createElement("td");
			//Joukkueen nimelle td
			let td2 = document.createElement("td");
			//Leimaustavoille td
			let td3 = document.createElement("td");
			//Pisteille td
			let td4 = document.createElement("td");

			// Järjestetään rastileimaukset leimausajan mukaan nousevaan järjestykseen
			let rastit = Array.from(joukkueYksi.getElementsByTagName("leimaus")).sort(function(a,b) {
				let c = new Date(a.getAttribute("aika"));
				let d = new Date(b.getAttribute("aika"));
				if (c>d) {
					return 1;
				}
				if (d>c) {
					return -1;
				}
				return 0;
				
			});
			
			let r = [];
			for (let k of rastit) {
				
				r.push(rastiObj[k.getAttribute("rasti")]);
			}
			
			// Pisteiden lasku
			if ( r.length == 0) {
				
				let pisteP = document.createElement("p");
				pisteP.textContent ="0";
				td4.appendChild(pisteP);
			} else {
				
				for ( let i = 0; i< r.length; i++) {
				
					if (r[i] == undefined) {
						
					   r.splice(i,1);
					   continue;
			   } 
			    if (r[0] == "MAALI") {
				r.splice(0,1);
				
			   } 
			   // Jos leimaus on LAHTO ja seuraava leimaus on myös LAHTO
			   // poistetaan ensimmäinen LAHTO leimaus
			   else if (r[i] == "LAHTO" && r[i] == r[i+1])
			   {
				
				r.splice(i,1);
				
			   } 
			   // Jos leimaus on MAALI ja sen jälkeen on vielä leimauksia
			   // poistetaan seuraava leimaus
			   else if (r[i] == "MAALI" && r[i+1] != undefined) {
				
				r.splice(i+1, 1);
			   }
			   
			   }
			  
			   let pisteet = 0;

			   // Poistetaan duplikaatit 
			   let uudetkoodit = [...new Set(r)];
			  
			for (let u = 0; u < uudetkoodit.length; u++) {
				// Jos koodin ensimmäinen merkki on kirjain lisätään pisteisiin 0
				if (isNaN(uudetkoodit[u].charAt(0))) {
				  pisteet += 0;
				} else {
				  // Muuten lisätään pisteisiin ensimmäinen merkki joka on muuutettu numeroksi
				  pisteet += parseInt(uudetkoodit[u].charAt(0));
				}
			   }
			  let pisteP = document.createElement("p");
			  pisteP.textContent = pisteet.toString();
			  td4.appendChild(pisteP);
			}
			
			
			let leimaustavat = Array.from(joukkueYksi.getElementsByTagName("leimaustapa")[0].children);
	
			// Lista leimaustapoja varten
			let leimauksetUL = document.createElement("ul");
			leimaustavat.sort(function(a,b) {
			if (leimausObj[a.textContent] < leimausObj[b.textContent]) {
				return -1;
			}
			if (leimausObj[a.textContent] > leimausObj[b.textContent]) {
				return 1;
			}
			return 0;
	});

	
		for (let i = 0; i < leimaustavat.length; i++) {
				
			let leimausli = document.createElement("li");
			leimausli.textContent = leimausObj[leimaustavat[i].textContent];
			leimauksetUL.appendChild(leimausli);
			}
			td3.appendChild(leimauksetUL);
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
			tr.appendChild(td2);
			tr.appendChild(td3);
			tr.appendChild(td4);
			// Tallennetaan joukkueen viite li elementtiin
			li1.joukkueYksi = joukkueYksi;
			joukkueYksi["tuloksetlista"] = {
				"nimi": joukkuenimi1,
				"sarja": sarjanimi1,
				"jasenet": jasenetnimet,
				"leimaustapa": leimauksetUL
			};
			
		
			tuloksetlista.appendChild(tr);
	}
}

// Sortataan joukkueet aluksi joukkueen sarjan mukaan nousevaan järjestykseen,
// sitten pisteiden mukaan laskevaan järjestykseen
function alkusorttaus() {
	sortOrder ="ALKU";
	let table, rows, switching, e, s, b,d, r, shouldSwitch;
	table = document.getElementById("tuloksetlista");
	switching = true;
	
	while(switching) {
		switching = false;
		rows = table.rows;
		// Loopataan taulukon rivit paitsi ei ekaa koska siinä on otsikoita
		for (e = 1; e < rows.length-1; e++) {
			shouldSwitch = false;
			s = rows[e].getElementsByTagName("td")[0];
			b = rows[e+1].getElementsByTagName("td")[0];
			d = rows[e].getElementsByTagName("p")[0];
			r = rows[e+1].getElementsByTagName("p")[0];
			if (s.textContent.toLowerCase().trim() > b.textContent.toLowerCase().trim()) {
				shouldSwitch = true;
				break;
			} else if (s.textContent.toLowerCase().trim() == b.textContent.toLowerCase().trim() && parseInt(r.textContent) > parseInt(d.textContent)) {
				shouldSwitch = true;
				break;
			}
			
		}
		// Jos löydettiin vaihdettavat elementit vaihdetaan rivien paikkaa
		if (shouldSwitch) {
			rows[e].parentNode.insertBefore(rows[e+1], rows[e]);
			switching = true;
		}
	}

}

// Joukkueen sarjan mukaan sorttaus nousevaan järjestykseen
function sarjasort() {
	sortOrder ="SARJA";
	let table, rows, switching, i, a, b, shouldSwitch;
	table = document.getElementById("tuloksetlista");
	switching = true;
	
	while(switching) {
		switching = false;
		rows = table.rows;
		// Loopataan taulukon rivit paitsi ei ekaa koska siinä on otsikoita
		for (i = 1; i < rows.length-1; i++) {
			shouldSwitch = false;
			a = rows[i].getElementsByTagName("td")[0];
			b = rows[i+1].getElementsByTagName("td")[0];
			if (a.textContent.toLowerCase().trim() > b.textContent.toLowerCase().trim()) {
				shouldSwitch = true;
				break;
			}
		}
		// Jos löydettiin vaihdettavat elementit vaihdetaan rivien paikkaa
		if (shouldSwitch) {
			rows[i].parentNode.insertBefore(rows[i+1], rows[i]);
			switching = true;
		}
	}

}


// Joukkueen mukaan sorttaus aakkosjärjestyksessä nousevaan järjestykseen
function joukkuesort() {
	sortOrder ="JOUKKUE";
	let table, rows, switching, i, a, b, shouldSwitch;
	table = document.getElementById("tuloksetlista");
	switching = true;
	while (switching) {
		switching = false;
		rows = table.rows;

		for(i = 1; i < rows.length-1; i++) {
			shouldSwitch = false;
			a = rows[i].getElementsByTagName("a")[0];
			b = rows[i+1].getElementsByTagName("a")[0];
			if (a.textContent.trim().toLowerCase() > b.textContent.trim().toLowerCase()) {
				shouldSwitch = true;
				break;
			}
		}

		if (shouldSwitch) {
			rows[i].parentNode.insertBefore(rows[i+1], rows[i]);
			switching = true;
		}
	}
}

//Joukkueen pisteiden mukaan sorttaus laskevaan järjestykseen
function pistesort() {
	sortOrder ="PISTE";
	let table, rows, switching, i, a, b, shouldSwitch;
	table = document.getElementById("tuloksetlista");
	switching = true;
	while (switching) {
		switching = false;
		rows = table.rows;

		for(i = 1; i < rows.length-1; i++) {
			shouldSwitch = false;
			a = rows[i].getElementsByTagName("p")[0];
			b = rows[i+1].getElementsByTagName("p")[0];
			if (parseInt(b.textContent) > parseInt(a.textContent)) {
				shouldSwitch = true;
				break;
			}
		}

		if (shouldSwitch) {
			rows[i].parentNode.insertBefore(rows[i+1], rows[i]);
			switching = true;
		}
	}
}
let muokkausbutton = document.getElementById("muokkausbutton");
	
	

// MUOKATAAN JOUKKUETTA
 function muokkaa(e) {

	lomake2.reset();

	//Poistetaan ylimääräiset jäsen-inputit jos vaan klikattiinkin toista
	//joukkuetta lomakkeelle
	let jasenlaatikot = document.getElementsByClassName("jasenet");
	for (let i = jasenlaatikot.length-1; i > 1; i--) {
		if (i > 1) {
		  jasenlaatikot[i].parentNode.remove();
		}
	  }

	  // Muutetaan submit-napin value oikeaksi että osataan 
	  // submit eventhandlerissa tehdä oikea tapahtuma
	tallennusbuttoni.value ="Tallenna muutokset";
	
	let joukkue = e.currentTarget.joukkueYksi;

	muokattava_joukkue = joukkue;
	
	
	muokattava_joukkue["nimi"] = joukkue["nimi"];
  	muokattava_joukkue["sarja"] = joukkue["sarja"];
  	muokattava_joukkue["jasenet"] = joukkue["jasenet"];
	muokattava_joukkue["leimaustapa"] = joukkue["leimaustapa"];
  
	alkuperainen_joukkue = joukkue;

	lomake2[`jnimi`].value = muokattava_joukkue["tuloksetlista"]["nimi"].textContent;

	
	let buttonit = document.getElementsByClassName("sarjabutton");
	let leimausbuttonit = document.getElementsByClassName("leimabutton");
	let muokattavanleimaukset = Array.from(muokattava_joukkue.getElementsByTagName("leimaustapa")[0].children);
	for (let i = 0; i < muokattavanleimaukset.length; i++) {
		
		for (let l of leimausbuttonit) {
			if (l.value == muokattavanleimaukset[i].textContent) {
				l.checked = true;
			}
		}
	}
	// käydään sarja radiobuttonit läpi ja etsitään oikea
	// ja checkataan se
	for (let i = 0; i < buttonit.length; i++) {
		if (buttonit[i].value == muokattava_joukkue["tuloksetlista"]["sarja"].textContent) {
     
     
			buttonit[i].checked = true;
		}
	}

	let muokattavanjasenet = muokattava_joukkue.getElementsByTagName("jasen");
	let muokattavan_jasenet_arr = [];

	for (let j of muokattavanjasenet) {
		
		muokattavan_jasenet_arr.push(j.textContent);
		
	}
	
	

	let i = 0;
	let jasennumero = 2;

	// Lisätään jäsenet oikeisiin inputteihin
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
			
			
			input.children[0].value = jasen;
		}

		input.indeksi = i;
	}
	
 }

 let joukkueennimi = document.getElementById("jnimi");

 // Joukkueen nimen lisäysinputit eventlistener ja tarkistukset
 joukkueennimi.addEventListener("input", function(e) {
	
	let joukkueennimii = e.target;
	joukkueennimii.setCustomValidity("");
	if (tallennusbuttoni.value == "Tallenna muutokset") {
		muokattava_joukkue["nimi"] = e.target.value;
		
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
	
		 let rasti = xmldata.documentElement.getElementsByTagName("rasti");
	
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

// Rastin lisäys funktio
 function lisays(e) {

	// Estetään lomakkeen sisällön lähetys wwww-palvelimelle
	e.preventDefault();

	let rastit = xmldata.documentElement.firstChild;
	let rasti = rastit.childNodes;
	

	// Haetaan hmtl forms 
	let lisayslomake = document.forms[1].elements;

	// Määritellään jokainen formsin solu
	let latlaatikko = lisayslomake["Lat"];
	let lonlaatikko = lisayslomake["Lon"];
	let koodilaatikko = lisayslomake["Koodi"];


	// Määritellään se, että mikään input laatikoista ei saa olla tyhjänä, muuten lisäystä ei tehdä
	

	if (!latlaatikko.value && !isNaN(latlaatikko.value)) {
		console.log("LAT PUUTTUU");
			return false;
	}


	if (!lonlaatikko.value && !isNaN(lonlaatikko.value)) {
		console.log("LON PUUTTUU");
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


// LOMAKEBUTTONIT

rastibuttonit();
function rastibuttonit() {

	let lisaysformi = document.forms[0].elements;
	
	let fieldsetti = lisaysformi[2].parentNode;
	let jasenetfieldsetti = lisaysformi[2];
	let sarjat = xmldata.documentElement.getElementsByTagName("sarja");
	
	let sarjatfield = document.createElement("fieldset");
	let sarjalegend = document.createElement("legend");
	let otsikko = document.createTextNode("Sarjat");
	sarjalegend.appendChild(otsikko);
	sarjalegend.otsikko = otsikko;
	sarjatfield.appendChild(sarjalegend);

	let leimatfield = document.createElement("fieldset");
	let leimalegend = document.createElement("legend");
	leimalegend.textContent ="Leimaustapa";
	leimatfield.appendChild(leimalegend);
	// Sortataan sarjat aakkosjärjestykseen sarjaobjektista
	let sortedsarjaObj = Object.entries(sarjaObj).sort(([,a],[,b]) => a.localeCompare(b));
	let sortedleimaObj = Object.entries(leimausObj).sort(([,a], [,b]) => a.localeCompare(b));
	
	
	//Käydään aakkosjärjestykseen sortatut
	//leimastavat läpi ja luodaan jokaiselle
	// oma checkbox ja lisätään sitten lomakkeeseen
	for (let leima of sortedleimaObj) {
		
		let leimap = document.createElement("p");
		let leimalabel = document.createElement("label");
		leimalabel.textContent = leima[1];
		let leimabox = document.createElement("input");

		leimabox.type = "checkbox";
		leimabox.name ="leimaustavat";
		leimabox.value = leima[0];
		leimabox.id = leima[0];
		leimabox.classList = "leimabutton";
		leimalabel.appendChild(leimabox);
		leimap.appendChild(leimalabel);
		leimatfield.appendChild(leimap);
	}
	fieldsetti.insertBefore(leimatfield, jasenetfieldsetti);
	
	//Käydään aakkosjärjestykseen sortatut sarjat
	//Läpi ja luodaan jokaiselle oma radiobutton
	//jotka lisätään sitten lomakkeeseen
	for (let sarja of sortedsarjaObj) {

	  let p = document.createElement("p");
	  let labeli = document.createElement("label");
	  labeli.textContent = sarja[0];
	  let radiobutton = document.createElement("input");
	  radiobutton.type = "radio";
	  radiobutton.name = "sarjat";
	  radiobutton.value = sarja[0];
	  radiobutton.id = sarja[1];
	  radiobutton.className = "sarjabutton";
	  labeli.appendChild(radiobutton);
	  p.appendChild(labeli);
	  sarjatfield.appendChild(p);
	  fieldsetti.insertBefore(sarjatfield, jasenetfieldsetti);
	
	}

	let buttonit = document.getElementsByClassName("sarjabutton");
	buttonit[0].checked = true;
}
	

	


// Uuden joukkueen lisäysfunktio
function joukkuelisays() {


	let lisayslomake = document.forms[1];
  
	let nimilaatikko = document.getElementById("jnimi"); 
	let valittusarja = lomake2.getElementsByClassName("sarjabutton");
  
	// Etsitään lomakkeesta valittu sarja radiobutton
	let valittusarjavalue;
	for (let i = 0; i < valittusarja.length; i++) {
	  if (valittusarja[i].checked) {
		valittusarjavalue = valittusarja[i].parentElement.textContent;
	  }
	}
	
   // Etsitään oikea sarjaid
   let sarjakey = Object.keys(sarjaObj).find(key => sarjaObj[key] === valittusarjavalue);
	
  

  let jasenlaatikot = document.getElementsByClassName("jasenet");
  
let leimausboxit = document.getElementsByClassName("leimabutton");
let leimaustavatElement = xmldata.createElement("leimaustapa");
//Käydään leimaus checkboxit läpi ja etsitään checkatut joista
// Tehdään leimaus elementtejä
for (let i = 0; i < leimausboxit.length; i++) {
	if (leimausboxit[i].checked) {
		let leimtapElement = xmldata.createElement("leimaustapa");
		leimtapElement.textContent = leimausboxit[i].value;
		leimaustavatElement.appendChild(leimtapElement);
	}
}

 let jasenetelement = xmldata.createElement("jasenet");
// Käydään jäsen inputit läpi 
// ja tehdään xml elementti jokaisesta inputin arvosta
for (let i = 0; i < jasenlaatikot.length; i++) {
	if (jasenlaatikot[i].value === "") {
		continue;
	}else {
		let jasenelement = xmldata.createElement("jasen");
		jasenelement.textContent = jasenlaatikot[i].value;
		jasenetelement.appendChild(jasenelement);
	}
}
  
	// LIsättävä joukkue
	// Luodaan uusi joukkue elementti xml rakenteeseen
	// ja annetaan sille oikeat attribuutit
	// ja lopulta lisätään joukkue olemassaolevaan
	// xmldata joukkueet elementtiins
	let uusijoukkue = xmldata.createElement("joukkue");
	uusijoukkue.setAttribute("aika", "00:00:00");
	uusijoukkue.setAttribute("matka", "0");
	uusijoukkue.setAttribute("sarja", sarjaObj[valittusarjavalue]);
	uusijoukkue.setAttribute("pisteet", "0");
	let rastileimaukset = xmldata.createElement("rastileimaukset");

	let joukkuenimi = xmldata.createElement("nimi");
	joukkuenimi.textContent = nimilaatikko.value;
  	
	// Lisätään uuteen joukkueeseen oikeat lapsielementit
	uusijoukkue.appendChild(rastileimaukset);
	uusijoukkue.appendChild(joukkuenimi);
	uusijoukkue.appendChild(leimaustavatElement);
	uusijoukkue.appendChild(jasenetelement);

	let joukkueet = xmldata.documentElement.lastChild;
	
	//Lisätään uusi joukkue xml joukkueisiin
	joukkueet.appendChild(uusijoukkue);
	
	return;
  
  
  }
  
  // ================================================================
  
  
  

  let jaseninputit = document.getElementsByClassName("jasenet");
  jaseninputit[1].addEventListener("input", lisaaJasenInput);


    function lisaaJasenInput(e) {
        // käydään läpi kaikki input-kentät viimeisestä ensimmäiseen
        let viimeinen_tyhja = -1; // viimeisen tyhjän kentän paikka listassa
        for(let i=jaseninputit.length-1 ; i>-1; i--) { // inputit näkyy ulommasta funktiosta
            let input = jaseninputit[i];
            
            if ( viimeinen_tyhja > -1 && input.value.trim() == "") { // ei kelpuuteta pelkkiä välilyöntejä
                let poistettava = jaseninputit[viimeinen_tyhja].parentNode; // parentNode on label
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
        // Lisätään oikea labelnimi
        for(let i=0; i<jaseninputit.length; i++) { 
                let label = jaseninputit[i].parentNode;
                label.firstChild.nodeValue = "Jäsen " + (i+1); // päivitetään labelin tekstin sisältö
        }
    
    }




  
  //Submit tapahtumankäsittelijä jossa myös poistetaan listaus ja lisätään se uudestaan uuden jäsenen kera
  lomake2.addEventListener("submit", function(e) {

	if (tallennusbuttoni.value =="Lisää joukkue") {
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

	console.log(sortOrder);
	if (sortOrder == "ALKU") {
		alkusorttaus();
	   } else if (sortOrder == "SARJA") {
		sarjasort();
	   } else if (sortOrder == "JOUKKUE") {
		joukkuesort();
	   } else if (sortOrder == "PISTE") {
		pistesort();
	   }
	
  

	} else if (tallennusbuttoni.value =="Tallenna muutokset") {
		e.preventDefault();
		let valittunimi = document.getElementById("jnimi");

		let valittusarja = lomake2.getElementsByClassName("sarjabutton");
	
		// ====================// ====================
		  let valittusarjavalue;
		  for (let i = 0; i < valittusarja.length; i++) {
			if (valittusarja[i].checked == true) {
			  valittusarjavalue = valittusarja[i].value;
			}
		  }

		  let alkuperLeimaukset = muokattava_joukkue.getElementsByTagName("leimaustapa")[0];
		  alkuperLeimaukset.textContent = "";
		
		  let leimText = [];
		  let leimausbuttonit = lomake2.getElementsByClassName("leimabutton");
		
		  for (let l of leimausbuttonit) {
			if (l.checked == true) {
				
				let leimElem = xmldata.createElement("leimaustapa");
				leimElem.textContent = l.value;
				alkuperLeimaukset.appendChild(leimElem);
				leimText.push(l.parentElement.textContent);
			}
			
		  }
		  let muokatutleimaukset = Array.from(alkuperLeimaukset.children);
		 

		  //Käydään läpi tulokset taulukossa olevien leimaustapojen li elementit
		  // Jos li elementtejä on enemmän kuin lomakkeessa on valittu lisätään
		  // uusi li elementti, jos li elementtejä on enemmän niin poistetaan 
		  // Lopuksi lisätään valitut leimaustavat li elementteihin
		  for (let i = 0; i < leimText.length; i++) {
			if (alkuperainen_joukkue["tuloksetlista"]["leimaustapa"].children.length < leimText.length) {
			
				let uusili = document.createElement("li");
				alkuperainen_joukkue["tuloksetlista"]["leimaustapa"].appendChild(uusili);
			
			} else if (alkuperainen_joukkue["tuloksetlista"]["leimaustapa"].children.length > leimText.length) {
				alkuperainen_joukkue["tuloksetlista"]["leimaustapa"].lastChild.remove();
			}
			let rivi = alkuperainen_joukkue["tuloksetlista"]["leimaustapa"].children[i];
			
			rivi.textContent = leimText[i];
		  }
		
		  let jasenetarray = [];
			let jasenlaatikot = document.getElementsByClassName("jasenet");

			for (let i = 0; i < jasenlaatikot.length; i++) {
			if (jasenlaatikot[i].value.length == 0) {
				continue;
			} else {
				jasenetarray.push(jasenlaatikot[i].value);
			}
			}
			muokattava_joukkue["nimi"] = valittunimi.value;
			 
  		muokattava_joukkue["sarja"] = valittusarjavalue;
  		muokattava_joukkue["jasenet"] = jasenetarray;
		
		
	  	alkuperainen_joukkue.getElementsByTagName("nimi")[0].textContent = muokattava_joukkue["nimi"];
	  	alkuperainen_joukkue.setAttribute("sarja", sarjaObj[muokattava_joukkue["sarja"]]);
	  	

			let jasenetjoukkueelle = alkuperainen_joukkue.getElementsByTagName("jasenet");
			// Tyhjennetään alkuperäisen joukkueen jäsenet elementti jotta voidaan
			//Lisätä uudet muokatut jäsenet 
			jasenetjoukkueelle.textContent = "";
	for (let j of muokattava_joukkue["jasenet"]) {
		let jasenelement = xmldata.createElement("jasen");
		jasenelement.textContent = j;
		alkuperainen_joukkue.getElementsByTagName("jasenet")[0].appendChild(jasenelement);
	}



	  	alkuperainen_joukkue["tuloksetlista"]["nimi"].textContent = muokattava_joukkue["nimi"];
	  	alkuperainen_joukkue["tuloksetlista"]["sarja"].textContent = valittusarjavalue;

	  
	let jasen1 ="";
	  for (let i = 0; i < muokattava_joukkue["jasenet"].length; i++) {
		if (muokattava_joukkue["jasenet"][i+1] === undefined) {
			jasen1 += muokattava_joukkue["jasenet"][i];
		} else {
			jasen1 += muokattava_joukkue["jasenet"][i];
			jasen1 += ", ";
		}
	}


	alkuperainen_joukkue["tuloksetlista"]["jasenet"].textContent = jasen1;

	lomake2.reset();
	
    for (let i = jasenlaatikot.length-1; i > 1; i--) {
      if (i > 1) {
        jasenlaatikot[i].parentNode.remove();
      }
    }
	if (sortOrder == "ALKU") {
		alkusorttaus();
	   } else if (sortOrder == "SARJA") {
		sarjasort();
	   } else if (sortOrder == "JOUKKUE") {
		joukkuesort();
	   } else if (sortOrder == "PISTEET") {
		pistesort();
	   }
	// Muutetaan submit buttonin arvo "Lisää joukkue", jotta osataan tehdä 
	// oikeat submit tapahtumat jatkossa
	tallennusbuttoni.value = "Lisää joukkue";
	}
	
	
  });


  // Joukkueen lisäys lomakkeelle tarkistukset
  // change eventlistenerillä
  lomake2.addEventListener("change", function(e) {

    let arr = document.getElementsByClassName("jasenet");
	// Tarkistetaan että edes yksi jäsenkenttä on täytetty 
  for( let j = 0; j < arr.length; j++) {
    arr[0].setCustomValidity("");
    if (arr[0].value.length == 0 && arr[1].value.length == 0 ) {
      arr[0].setCustomValidity("Joukkueella täytyy olla edes yksi jäsen");
    } else {
      arr[0].setCustomValidity("");
    }
  }

  let leimausboxit = document.getElementsByClassName("leimabutton");
  let apuarray = [];
  // Tarkistetaan että edes yksi leimaustapa on valittu
  for (let l = 0; l < leimausboxit.length; l++) {
	leimausboxit[0].setCustomValidity("");
	if (leimausboxit[l].checked == true) {
		apuarray.push(leimausboxit[l].value);
	}
	 if (apuarray.length == 0) {
		leimausboxit[1].setCustomValidity("Vähintään yksi leimaustapa täytyy valita!");
	 } else {
		leimausboxit[1].setCustomValidity("");
	 }
  }
  });
  


  // Rastilisäys lomakkeelle tarkistin
  let koodiinput = document.getElementById("rastilisaus").Koodi;
  let rastit = xmldata.documentElement.getElementsByTagName("rasti");
  koodiinput.addEventListener("input", function(e) {
	let koodiinput = e.target;
	koodiinput.setCustomValidity("");
	// Tarkistetaan että lisättävää koodinimeä ei jo löydy
	//xml rakenteesta tai ettei koodikenttä ole tyhjä
	if ( !koodiinput.value.trim()) {
		koodiinput.setCustomValidity("Rastilla täytyy olla koodi");
	} else {
		for (let rasti of rastit) {
			if (koodiinput.value.trim().toLowerCase() === rasti.getAttribute("koodi").trim().toLowerCase()) {
				koodiinput.setCustomValidity(rasti.getAttribute("koodi") + "-rasti on jo olemassa!");
			}
	}
	}
	
  });
  

	  }
	);

	

  });
 
}
