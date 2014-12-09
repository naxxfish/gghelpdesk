$( document ).ready(function(){
	$("#loadNextBtn").click(function (e) {
		$("div#ticker").text("Waiting for next new item...")
		autoloadNext()
	})
	$("iframe#forum").hover( function () {
		$("iframe#forum").animate({'width': "75%" },250)
		$("iframe#kb").animate({'width': "25%" }, 250)
	})
	$("iframe#kb").hover( function () {
		$("iframe#forum").animate({'width': "25%" },250)
		$("iframe#kb").animate({'width': "75%" }, 250)
	})
})


function autoloadNext()
{
	$("#ticker").text("Loading feed")
	$("#header").css('background',"orange")
	$.getJSON("/newitems", function ( data ) {
		
		var items = data.items
		if (items.length >= 1)
		{
			$("#ticker").html("Opening : <a href='" + items[0].link + "'>" + items[0].title + "</a> from " + items[0].ago)
			$("#header").css('background',"green")

			$("#forum").attr('src',items[0].link)
		} else {
			$("#ticker").text("No new threads - waiting for new threads...")
			$("#header").css('background',"yellow")

			setTimeout(autoloadNext,5000)
		}
	})
}
