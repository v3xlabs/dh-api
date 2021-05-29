terraform {
  backend "remote" {
    organization = "dogehouse"

    workspaces {
      name = "api"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

variable "container" {}
variable "deployurl" {}

resource "kubernetes_deployment" "api" {
    metadata {
        name = "api"
        namespace = "dogehouse"
        labels = {
            app = "api"
        }
    }

    spec {
        replicas = 3
        
        selector {
            match_labels = {
                app = "api"
            }
        }

        template {
            metadata {
                name = "api"
                namespace = "dogehouse"
                labels = {
                    app = "api"
                }
            }

            spec {
                container {
                    image = var.container
                    name = "api"

                    port {
                        container_port = 3000
                    }
                    
                    env {
                        name = "AUTH_TOKEN"
                        value_from {
                            config_map_key_ref {
                                name = "config"
                                key = "AUTH_TOKEN"
                            }
                        }
                    }

                    liveness_probe {
                        http_get {
                            path = "/"
                            port = 3000
                        }

                        initial_delay_seconds = 3
                        period_seconds        = 3
                    }
                }
                
                image_pull_secrets {
                    name = "regcred"
                }
            }
        }
    }
}

resource "kubernetes_service" "api" {
    metadata {
        name = "api"
        namespace = "dogehouse"
    }

    spec {
        selector = {
            app = kubernetes_deployment.api.metadata.0.labels.app
        }
        port {
            port = 3000
            target_port = 3000
        }
        type = "ClusterIP"
    }
}

resource "kubernetes_ingress" "api" {
    metadata {
        name = "api"
        namespace = "dogehouse"
        annotations = {
            "traefik.ingress.kubernetes.io/router.tls" = "true"
            "traefik.ingress.kubernetes.io/router.tls.certresolver" = "letsencrypt"
            "traefik.ingress.kubernetes.io/priority" = "4"
        }
    }

    spec {
        rule {
            host = var.deployurl
            http {
                path {
                    path = "/"
                    backend {
                        service_name = kubernetes_service.api.metadata.0.name
                        service_port = 3000
                    }
                }
            }
        }
    }
}