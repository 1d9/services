data "external" "package" {
  program = ["node", "scripts/buildPackage.js"]
  query = {
    tag = "v1.2.0",
    name = "andy"
  }
}

output "package" {
  value = "${data.external.package.result.filename}"
}