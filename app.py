import sys
from binascii import a2b_base64
import cv2
import cv2.cv as cv
import numpy as np
from twisted.web.static import File
from twisted.python import log
from twisted.web.server import Site
from twisted.internet import reactor
import json
from autobahn.twisted.websocket import WebSocketServerFactory, \
    WebSocketServerProtocol
from autobahn.twisted.resource import WebSocketResource


class SomeServerProtocol(WebSocketServerProtocol):
    def onConnect(self, request):
        print("come")
        #print("some request connected {}".format(request))

    def onMessage(self, payload, isBinary):
		print("received")

		fd = open('image.png', 'wb')
		fd.write(payload)
		fd.close()

		image = cv2.imread("C:/Users/Johnhckuo/Desktop/dd/image.png")

		print(image.shape)
		
		#self.sendMessage("message received")
		t = 100
		
		last = 0
	
		img_height, img_width, depth = image.shape
		w = img_width
		scale = w / img_width
		h = img_height * scale
		image = cv2.resize(image, (0,0), fx=scale, fy=scale)

		# Apply filters
		grey = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
		blured = cv2.medianBlur(grey, 9)

		# Compose 2x2 grid with all previews
		grid = np.zeros([2*h, 2*w, 3], np.uint8)
		grid[0:h, 0:w] = image
		# We need to convert each of them to RGB from grescaled 8 bit format
		grid[h:2*h, 0:w] = np.dstack([cv2.Canny(grey, t / 2, t)] * 3)
		grid[0:h, w:2*w] = np.dstack([blured] * 3)
		grid[h:2*h, w:2*w] = np.dstack([cv2.Canny(blured, t / 2, t)] * 3)


		sc = 1
		md = 30
		at = 40
		circles = cv2.HoughCircles(blured, cv.CV_HOUGH_GRADIENT, sc, md, t, at)
		
		if circles is not None:
			# We care only about the first circle found.
			circle = circles[0][0]
			x, y, radius = int(circle[0]), int(circle[1]), int(circle[2])
			print(x, y, radius)

			# Highlight the circle
			cv2.circle(image, (x, y), radius, (0, 0, 255), 10)
			# Draw dot in the center
			cv2.circle(image, (x, y), 1, (0, 0, 255), 10)

			self.sendMessage(json.dumps({'x': x , 'y': y , 'radius': radius }))
			#self.sendMessage("get")
		#cv2.imshow('Image with detected circle', image)


		

if __name__ == "__main__":
    log.startLogging(sys.stdout)

    # static file server seving index.html as root
    root = File(".")

    factory = WebSocketServerFactory(u"ws://127.0.0.1:5000")
    factory.protocol = SomeServerProtocol
    resource = WebSocketResource(factory)
    # websockets resource on "/ws" path
    root.putChild(u"ws", resource)

    site = Site(root)
    reactor.listenTCP(5000, site)
    reactor.run()