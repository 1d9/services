resource "aws_elastic_beanstalk_application" "andy" {
  name        = "1d9 - Andy"
  description = "A simple Dice roller service"
}

data "aws_s3_bucket" "app_sources" {
  bucket = "tome-beanstalk-sources"
}

resource "aws-uncontrolled_elastic_beanstalk_application_version" "current-version" {
  application_name = "${aws_elastic_beanstalk_application.andy.name}"
  application_store_bucket_name = "${data.aws_s3_bucket.app_sources.bucket}"
  application_version_filename = "${data.external.package.result.filename}"
}

resource "aws_elastic_beanstalk_environment" "prod" {
  name                = "Andy-Production"
  version_label       = "${aws-uncontrolled_elastic_beanstalk_application_version.current-version.application_version_label}"
  application         = "${aws_elastic_beanstalk_application.andy.name}"
  solution_stack_name = "64bit Amazon Linux 2018.03 v2.12.17 running Docker 18.06.1-ce"

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = "aws-elasticbeanstalk-ec2-role"
  }
}

output "andy-origin" {
  value = "${aws_elastic_beanstalk_environment.prod.cname}"
}