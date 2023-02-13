const express = require("express");
const permissionsPolicy = require("permissions-policy")

const app = express();
const port = 8080

app.use(permissionsPolicy({
	features: {
		camera: ["self"]
	}
}))

app.use("/models", express.static("models"))

app.use("/", express.static("dist"))

app.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`)
})