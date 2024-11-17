self.addEventListener("install", (event) => {
    self.clients.claim()
    console.log("Service worker installing")
    event.waitUntil(() => {
        console.log("Service worker installed")

    })
});

self.addEventListener("activate", (event) => {
    console.log("SW active")
    clients.claim()
})

self.addEventListener("")