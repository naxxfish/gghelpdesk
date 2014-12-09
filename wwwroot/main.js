$( document ).ready(function(){
	$("#iframe").height($("#container").height()-35)
	$("#loadNextBtn").click(function (e) {
		$("div#ticker").text("Waiting for next new item...")
		autoloadNext()
	})
})


function autoloadNext()
{
	$("#ticker").text("Loading feed")
	$("#header").css('background',"orange")
	$("#overlay").css(
		{ opacity: 0.7,
		'display':'block',
		'width':$(document).width(),
		'height':$(document).height()
		}
	)

	$.getJSON("/newitems", function ( data ) {
		
		var items = data.items
		if (items.length >= 1)
		{
			$("#ticker").html("Opening : <a href='" + items[0].link + "'>" + items[0].title + "</a> from " + items[0].ago)
			$("#header").css('background',"green")
			$("#overlay").css({display: 'none'})

			$("#forum").attr('src',items[0].link)
		} else {
			$("#ticker").text("No new threads - waiting for new threads...")
			$("#header").css('background',"yellow")

			setTimeout(autoloadNext,5000)
		}
	})
}
