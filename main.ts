import { Construct } from 'constructs'
import { App, Chart, ChartProps } from 'cdk8s'
import { join } from 'path'
import { 
  Namespace, 
  ClusterRole, 
  ApiResource, 
  NonApiResource, 
  ServiceAccount, 
  Deployment, 
  Volume,
  ConfigMap} 
from 'cdk8s-plus-25'


export class MyChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props)

    const namespace = new Namespace(this, 'monitoring')

    const clusterRole = new ClusterRole(this, 'cluster-role')

    clusterRole.allowRead(ApiResource.NODES) 
    clusterRole.allowRead(ApiResource.SERVICES)
    clusterRole.allowRead(ApiResource.ENDPOINTS)
    clusterRole.allowRead(ApiResource.PODS)
    clusterRole.allowRead(ApiResource.INGRESSES)
    clusterRole.allowGet(NonApiResource.of('/metrics'))

    const serviceAccount = new ServiceAccount(this, 'service-account')
    
    clusterRole.bind(serviceAccount)
    
    const configMap = new ConfigMap(this, 'configmap')
    configMap.addFile(join(__dirname + 'prometheus.yml'))

    const configVolume = Volume.fromConfigMap(this, 'config-volume', configMap)
    const dataVolume = Volume.fromEmptyDir(this, 'data-volume', 'data')
    
    const deployment = new Deployment(this, 'deployment', {
      containers: [ 
        {
          name: 'prometheus',
          image: 'prom/prometheus',
          args: ['--config.file=/etc/prometheus/prometheus.yml'],
          portNumber: 9090,
        }
      ]
    })

    deployment.containers[0].mount('/etc/prometheus/', configVolume)
    deployment.containers[0].mount('/data/', dataVolume)
  
  }
}

const app = new App()
new MyChart(app, 'CDK8s-Prometheus')
app.synth()
