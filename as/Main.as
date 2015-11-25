package  {
	import com.jonas.net.Multipart;
	import flash.display.MovieClip;
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.utils.ByteArray;
	import flash.external.ExternalInterface;
	import flash.system.Security;
	
	
	public class Main extends MovieClip {
		
		
		public function Main() {
			var url = stage.loaderInfo.parameters["url"];
			var img = unescape(stage.loaderInfo.parameters["img"]);
			var cb = stage.loaderInfo.parameters["callback"];
			var id = stage.loaderInfo.parameters["id"];
			ExternalInterface.call(cb, id, 'inited');			
			var image = Base64.decode(img);
			var form:Multipart = new Multipart(url);
			form.addFile("photo", image, "image/png", "test.png");
			form.addField("test", image);
			var loader:URLLoader = new URLLoader();
			loader.addEventListener(Event.COMPLETE, function(event: Event) {
				ExternalInterface.call(cb, id, 'success', loader.data);
			});
			try {
				loader.load(form.request);
			} catch (error: Error) {
				ExternalInterface.call(cb, id, 'error');
			}	
		}
	}
	
}