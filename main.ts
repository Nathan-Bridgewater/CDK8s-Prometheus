import { Construct } from 'constructs'
import { App, Chart, ChartProps } from 'cdk8s'
import { Namespace, ClusterRole, ApiResource, NonApiResource, ClusterRoleBinding, ServiceAccount } from 'cdk8s-plus-25'

export class MyChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props)

    const namespace = new Namespace(this, 'monitoring')

    const clusterRole = new ClusterRole(this, 'prometheus-cluster-role')

    clusterRole.allowRead(ApiResource.NODES) 
    clusterRole.allowRead(ApiResource.SERVICES)
    clusterRole.allowRead(ApiResource.ENDPOINTS)
    clusterRole.allowRead(ApiResource.PODS)
    clusterRole.allowRead(ApiResource.INGRESSES)
    clusterRole.allowGet(NonApiResource.of('/metrics'))

    const serviceAccount = new ServiceAccount(this, 'prometheus-service-account')

    clusterRole.bind(serviceAccount)

  
  }
}

const app = new App()
new MyChart(app, 'CDK8s-Prometheus')
app.synth()
