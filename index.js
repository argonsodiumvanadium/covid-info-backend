SERVER_IP = "/"



main = () => {
	createLinksForResources()
}

createLinksForResources = async () => {
	links = document.getElementsByClassName("resource")
	console.log(links)
	for (link of links) {
		console.log(link)
		link.onclick = function () {
			renderResource(this.textContent)
		}
	}
}


renderResource = name => {
	name = name.trim()
	switch (name) {
		case "Ambulances":
			renderAmblanceTaxiPage()
	}
}

renderAmblanceTaxiPage = async () => {
	HTML = ""

	console.log(SERVER_IP)
	console.log("fetching")

	fetch (SERVER_IP+"API/AmbulanceTaxi.json").
	then  (response => response.json()).
	then  (result => {
		
		document.getElementById("heading").textContent = "Ambulances"

		document.getElementById("image").src = SERVER_IP+"assets/ambulance.png"

		console.log(result)
		result.forEach(el => {
			verificationText = ""

			time = get_time(el["verification status"])

			if (el.verified) {	
				verificationText = `<span class='tag is-success is-size-6'>${el["verification status"]}</span>`
			} else {
				verificationText = `<span class='tag is-danger is-size-6'>${el["verification status"]}</span>`
			}

			delete el["verification status"]

			areaText = ""

			if (el.area != null && el.area.trim() != "") {
				areaText = `<h4>nearby <b>${el.area}</b></h4>`
			}

			sep = el["area"]

			delete el["area"]

			telephoneText = ""


			for (num of el.telephone.split(",")) {
				telephoneText += `<span onclick="window.open('tel:${num}');" style="color:#0066ff;cursor:pointer"><b><strong>
				+91 ${num}
				</strong></b></span>  `
			}

			delete el["telephone"]

			HTML +=`
				<div class="column is-4" separator="${sep}">
					<div class="notification" separator="${time}">
						<h1><strong>${el["distributor name"]}</strong></h1>
						<h3>${telephoneText}</h3>
						<br><h4>${verificationText}</h4><br>
						<hr class="navbar-divider">
						${areaText}
			`

			for (key of Object.keys(el)) {
				if (el[key] != ""){
					HTML += `<h4>${key}, <b>${el[key]}</b></h4>`
				}
			}

			HTML += "</div></div>"
		})

		document.getElementById("main").innerHTML = HTML

		holders = arrangeBy(document.getElementById("main"), loc => {
			if (loc.toUpperCase().includes("DELHI") || loc == "Rajouri garden") {
				return "Delhi"
			} else if (loc.toUpperCase().includes("NOIDA") || loc.toUpperCase().includes("GHAZIABAD")) {
				return "Uttar Pradesh"
			} else if (loc == "") {
				return "Other"
			} else {
				return loc.substring(0,1).toUpperCase() + loc.substring(1)
			}
		})
	})
}

get_time = ver => {
	strs = ver.split(/[ ,]+/).filter(Boolean);

	for (str of strs) {
		if (str.includes("/")){
			return str
		}
	}
}

/*
	arranges the html dom elements by their property "seperator"
	and appends it to parent
*/

arrangeBy = (parent,filter) => {
	holders = []

	if (filter == undefined) {
		filter = loc => {
			return loc
		}
	}
	console.log(parent.children[0].attributes.separator.nodeValue)
	
	console.log("arranging")

	locationMap = {}

	for (child of parent.children) {
		loc = filter(child.attributes.separator.nodeValue)

		if (locationMap[loc] == undefined) {
			locationMap[loc] = []

		}

		locationMap[loc].push(child)

	}

	console.log(locationMap)

	for (loc in locationMap) {
		array = locationMap[loc]

		holder = document.createElement("div")
		holder.className = "columns column is-12 is-multiline"
		holder.innerHTML = `
			<h1 class="is-size-1 column is-12">${loc}</h1><br>
		`

		for (element of array) {
			holder.appendChild(element)
		}

		holders.push(holder)

		parent.appendChild(holder)
	}

	return holders

}

main()
