var link = "https://docs.google.com/spreadsheets/d/16-UdbV7hX7vRVxT2EVHDjXscaAnE5QKTjG-7JIFdOHM/edit#gid=0"
var API_PATH = "./test_data/"

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
			console.log(this.textContent)
			renderResource(this.textContent)
		}
	}
}


renderResource = name => {
	name = name.trim()
	console.log(name == "Ambulances")
	switch (name) {
		case "Ambulances":
			renderAmblanceTaxiPage()
	}
}

renderAmblanceTaxiPage = async () => {
	HTML = ""

	console.log(SERVER_IP)

	fetch (SERVER_IP+"API/AmbulanceTaxi.json").
	then  (response => response.json()).
	then  (result => {
		
		document.getElementById("heading").textContent = "Ambulances"

		document.getElementById("image").src = SERVER_IP+"assets/ambulance.png"

		console.log(result)
		result.forEach(el => {
			verificationText = ""

			if (el.verified) {	
				verificationText = `<span class='tag is-success is-size-6'>${el.verification}</span>`
			} else {
				verificationText = `<span class='tag is-danger is-size-6'>${el.verification}</span>`
			}

			areaText = ""

			if (el.area != null) {
				areaText = `<h4>nearby <b>${el.area}</b></h4>`
			}

			infoText = ""

			if (el.information != null) {
				infoText = `<h4>some additional information <b>${el.information}</b></h4>`
			}

			telephoneText = ""

			for (num of el.telephone.split(",")) {
				telephoneText += `<span onclick="window.open('tel:${num}');" style="color:#0066ff;cursor:pointer"><b><strong>
				+91 ${num}
				</strong></b></span>  `
			}



			HTML +=`
				<div class="column is-4" separator="${el.address}">
					<div class="notification">
						<h1><strong>${el.service}</strong></h1>
						<h3>${telephoneText}</h3>
						<br><h4>${verificationText}</h4><br>
						<hr class="navbar-divider">
						<h4 class="address">address : ${el.address}</h4>
						${areaText}
						${infoText}

					</div>
				</div>
			`
		})

		document.getElementById("main").innerHTML = HTML

		arrangeBy(document.getElementById("main"),"address", loc => {
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

arrangeBy = async (parent,arg,filter) => {
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

		parent.appendChild(holder)
	}


}

main()