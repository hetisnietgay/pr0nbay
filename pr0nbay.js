// ==UserScript==
// @name		pr0nbay
// @namespace	http://tampermonkey.net/
// @version		0.2
// @description	pornbay.org enhancements.
// @author		kayos
// @match		https://pornbay.org/torrents.php*
// @match		https://pornbay.org/top10.php*
// @grant		GM_getValue
// @grant		GM_setValue
// @grant		GM_xmlhttpRequest
// @grant		unsafeWindow
// @require		https://raw.githubusercontent.com/AugmentedWeb/UserGui/main/usergui.js
// @require		http://code.jquery.com/jquery-latest.js
// ==/UserScript==

/*
HiddenTags defines a list of tags
that when attributed to a torrent
will hide that torrent search/browse/top10.
*/
let HiddenTags = GM_getValue(
		"HiddenTags", [])
	let FilterTags = GM_getValue("FilterTags", true)
	
	/*
	ExpandSpoilers was actually built as a
	bugfix for the original thumbnailer script.
	Using it would cause the inability to expand
	spoilers on any torrent pages. Basically FIXME.
	*/
	let ExpandSpoilers = GM_getValue(
		"ExpandSpoilers", true)
	/*
	HideSnatched will hide all torrents in
	search/browse/top10 that you have already
	fully downloaded.
	*/
	let HideSnatched = GM_getValue(
		"HideSnatched", true)
	
	/*
	HideSeeding will hide all torrents in
	search/browse/top10 that you are
	currently seeding.
	*/
	let HideSeeding = GM_getValue(
		"HideSeeding", true)
	
	/*
	Thumbnailer credit goes to:
	https://sleazyfork.org/en/scripts/21024-pornhub-thumbnail
	*/
	let Thumbnailer = GM_getValue(
		"Thumbnailer", true)
	
	/*~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~*/
	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	/*       eslint-env jquery       */
	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	/*~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~*/
	
	const Gui = new UserGui;
	Gui.settings.window.title = "pr0nbay settings";
	Gui.settings.window.centered = true;
	Gui.settings.window.width = "auto";
	Gui.settings.gui.internal.darkCloseButton = true;
	Gui.settings.gui.centeredItem = true;
	Gui.settings.gui.style = ``
	
	const banner = `ICAgICAgICwtLiAgICAuICAgICAgICAgCiAgICAgIC8gIC9cICAgfCAgICAgICAgIAo7LS47LS58IC8gfDstLnwtLiwtOi4gLiAKfCB8fCAgXC8gIC98IHx8IHx8IHx8IHwgCnwtJycgICBgLScgJyAnYC0nYC1gYC18IAonICAgICAgICAgICAgICAgICAgIGAtJyAK`
	Gui.addPage("pr0nbay", atob(
		/*<payload>*/
		`PGRpdiBjbGFzcz0icmVuZGVyZWQtZm9ybSI+CiAgICA8ZGl2IGNsYXNzPSIiPgogICAgICAgIDxoMSBjbGFzcz0iYmFubmVyIiBpZD0iYmFubmVyIj5wcjBuYmF5PC9oMT48L2Rpdj4KICAgIDxkaXYgY2xhc3M9ImZvcm1idWlsZGVyLWNoZWNrYm94LWdyb3VwIGZvcm0tZ3JvdXAgZmllbGQtZmVhdHVyZXMiPgogICAgICAgIDxsYWJlbCBjbGFzcz0iZm9ybWJ1aWxkZXItY2hlY2tib3gtZ3JvdXAtbGFiZWwiPnN3aXRjaGVzCiAgICAgICAgICAgIDxicj4KICAgICAgICA8L2xhYmVsPgogICAgICAgIDxkaXYgY2xhc3M9ImNoZWNrYm94LWdyb3VwIj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybWJ1aWxkZXItY2hlY2tib3gtaW5saW5lIj4KICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz0iZGlwc3dpdGNoZXMiIG5hbWU9ImZlYXR1cmVzW10iICBpZD0iZmVhdHVyZXMtMCIgdmFsdWU9InRydWUiIHR5cGU9ImNoZWNrYm94IiBjaGVja2VkPSJjaGVja2VkIj4KICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9ImZlYXR1cmVzLTAiPnRhZy1maWx0ZXJpbmc8L2xhYmVsPgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybWJ1aWxkZXItY2hlY2tib3gtaW5saW5lIj4KICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz0iZGlwc3dpdGNoZXMiIG5hbWU9ImZlYXR1cmVzW10iICBpZD0iZmVhdHVyZXMtMSIgdmFsdWU9InRydWUiIHR5cGU9ImNoZWNrYm94IiBjaGVja2VkPSJjaGVja2VkIj4KICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9ImZlYXR1cmVzLTEiPmhpZGUtc25hdGNoZWQ8L2xhYmVsPgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybWJ1aWxkZXItY2hlY2tib3gtaW5saW5lIj4KICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz0iZGlwc3dpdGNoZXMiIG5hbWU9ImZlYXR1cmVzW10iICBpZD0iZmVhdHVyZXMtMiIgdmFsdWU9InRydWUiIHR5cGU9ImNoZWNrYm94IiBjaGVja2VkPSJjaGVja2VkIj4KICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9ImZlYXR1cmVzLTIiPnRodW1ibmFpbC1icm93c2U8L2xhYmVsPgogICAgICAgICAgICA8L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0iZm9ybWJ1aWxkZXItY2hlY2tib3gtaW5saW5lIj4KICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz0iZGlwc3dpdGNoZXMiIG5hbWU9ImZlYXR1cmVzW10iICBpZD0iZmVhdHVyZXMtMyIgdmFsdWU9InRydWUiIHR5cGU9ImNoZWNrYm94IiBjaGVja2VkPSJjaGVja2VkIj4KICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9ImZlYXR1cmVzLTMiPmV4cGFuZC1zcG9pbGVyczwvbGFiZWw+CiAgICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvZGl2PgogICAgPC9kaXY+CiAgICA8ZGl2IGNsYXNzPSIiPgogICAgICAgIDxibG9ja3F1b3RlIGNsYXNzPSJ0YWctcG9vbCIgIGlkPSJjb250cm9sLTk0MTU0NTUiPnZyLnBvcm4KICAgICAgICAgICAgPGJyPgogICAgICAgIDwvYmxvY2txdW90ZT4KICAgIDwvZGl2PgogICAgPGlucHV0IHR5cGU9ImhpZGRlbiIgbmFtZT0iaGlkZGVudGFncyIgIGlkPSJoaWRkZW50YWdzIj4KICAgIDxkaXYgY2xhc3M9ImZvcm1idWlsZGVyLWJ1dHRvbiBmb3JtLWdyb3VwIGZpZWxkLXNhdmUiPgogICAgICAgIDxidXR0b24gdHlwZT0ic3VibWl0IiBjbGFzcz0iYnRuLXN1Y2Nlc3MgYnRuIiBuYW1lPSJzYXZlIiB2YWx1ZT0ic2F2ZSIgc3R5bGU9InN1Y2Nlc3MiIGlkPSJzYXZlIj5zYXZlPC9idXR0b24+CiAgICA8L2Rpdj4KICAgIDxkaXYgY2xhc3M9ImZvcm1idWlsZGVyLWJ1dHRvbiBmb3JtLWdyb3VwIGZpZWxkLXJlc2V0Ij4KICAgICAgICA8YnV0dG9uIHR5cGU9InJlc2V0IiBjbGFzcz0iYnRuLXdhcm5pbmcgYnRuIiBuYW1lPSJyZXNldCIgdmFsdWU9InJlc2V0IiBzdHlsZT0id2FybmluZyIgaWQ9InJlc2V0Ij5yZXNldDwvYnV0dG9uPgogICAgPC9kaXY+CjwvZGl2Pgo=`
		/*</payload>*/
	));
	
	const re = /src=(.*\.\w{3,4})/;
	const olre = /var\s(overlay\d*)\s/;
	
	/*
	Gui.open(() => {
		document.addEventListener(
			"keydown", (e) => {
				log("DOWN: " + e.key.toString());
			});
		document.addEventListener(
			"keyup", (e) => {
				log("UP: " + e.key.toString());
				Gui.saveConfig()
			});
		log("GUI opened");
		return true;
	})
	*/
	
	function log(s) {
		let tn = new
		Date(jQuery.now()).toISOString().split("T")[1];
		console.log(
			tn + " %c[pr0nbay]",
			"background: #000000; " +
			"color: #bada55", s
		);
	}
	
	console.log("\n"+atob(banner))
	log("init");
	
	if (FilterTags) {
		log(
			"avoiding " +
			HiddenTags.length +
			" total tags"
		);
	}
	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	if (ExpandSpoilers) {
		let divs = document.getElementsByClassName("spoiler");
		divs = Array.from(divs);
		divs.forEach(function (div) {
			div.classList.remove("hidden");
		});
	}
	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	let torrents;
	if (FilterTags || Thumbnailer) {
		log("indexing torrents from page")
		torrents = $(".torrent");
	}
	if (FilterTags) {
		torrents.each(function () {
			let match = $(this).find("div.tags > a");
			match.each(
				function () {
					if (!($.inArray($(this).text(),
									HiddenTags) !== -1)) {
						return;
					}
					log("hide " + $(this).text());
					match.closest("tr").css(
						"display", "none"
					);
				});
		});
	}
	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	if (HideSnatched) {
		let oldies = $(
			"a[title=\"Previously Snatched Torrent\"]");
		oldies.each(function () {
			let oldfolks = $(this).closest("tr");
			log(
				"removing snatched torrent",
				$(this)
			);
			oldfolks.css("display", "none");
		});
	}
	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	if (HideSeeding) {
		let seeding = $(
			"a[title=\"Currently Seeding Torrent\"]");
		seeding.each(function () {
			let stor = $(this).closest("tr");
			log(
				"removing currently seeding torrent",
				$(this)
			);
			stor.css("display", "none");
		});
	}
	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
	if (Thumbnailer) {
		$(".torrent_table > tbody > tr:first-child > td:first-child").after("<td>Screenshot</td>");
		torrents.each(function () {
			let curVar = olre.exec($(this).find("script").html())[1];
			let str = unsafeWindow[curVar];
			let m;
			let src = "";
			if ((m = re.exec(str)) == null) {
				return;
			}
			if (m.index === re.lastIndex) {
				re.lastIndex++;
			}
			if (m[1].indexOf("noimage.png") >= 0) {
				src = "https://pornbay.org//";
			}
	
			src += m[1];
	
			$("td:first", $(this)).after(
				"<td>" +
				"<img style=\"width:300px\" src=\"" + src + "\"</img>" +
				"</td>"
			);
		});
	}
	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/