# GitOps Demo con Node.js, Docker, Helm y ArgoCD 🚀

Este proyecto implementa una aplicación mínima en **Node.js** y la despliega en Kubernetes usando un flujo **GitOps**.  
El objetivo es demostrar cómo integrar:

- **GitHub Actions** → build y push de la imagen Docker (tag = commit SHA).
- **Helm Chart** → describe cómo desplegar la app en Kubernetes.
- **ArgoCD** → sincroniza automáticamente el cluster con el estado declarado en Git.
- **DockerHub** → almacena las imágenes versionadas.

---

## 📂 Estructura del repositorio

```
my-gitops-repo/
├─ .github/
│  └─ workflows/
│     └─ deploy.yaml        # Workflow de CI/CD
├─ app/                     # Código de la aplicación (Node.js)
│  ├─ package.json
│  └─ index.js
├─ charts/
│  └─ myapp/                # Helm Chart de la aplicación
│     ├─ Chart.yaml
│     ├─ values.yaml
│     └─ templates/
│        ├─ deployment.yaml
│        └─ service.yaml
└─ argocd/
   └─ application.yaml       # Definición de la aplicación en ArgoCD
```

---

## ⚡ Flujo GitOps

1. Haces un **commit en main** → GitHub Actions construye y publica la imagen en DockerHub.  
2. El workflow actualiza `values.yaml` con el nuevo `image.tag`.  
3. ArgoCD detecta el cambio en Git y sincroniza el chart con el cluster.  
4. Kubernetes levanta el **Deployment + Service** con la nueva versión.  

Todo el ciclo está gobernado por **Git como fuente de verdad** ✅.

---

## ✅ Pasos de verificación

### 🔹 1. Validar la imagen en DockerHub

Haz un commit en `main` y verifica que el workflow de GitHub Actions corra.  
En la pestaña **Actions** del repo deberías ver el job ejecutado.  

Confirma en **DockerHub** que apareció la nueva imagen con el tag igual al commit SHA.

```bash
docker pull docker.io/<tu-usuario>/myapp:<commit-sha>
docker run -p 3000:3000 docker.io/<tu-usuario>/myapp:<commit-sha>
curl http://localhost:3000
# → debería responder: Hello from myapp! version=<commit-sha>
```

[![Captura-de-pantalla-2025-09-17-180531.png](https://i.postimg.cc/SRJ40kct/Captura-de-pantalla-2025-09-17-180531.png)](https://postimg.cc/dZPprMH8)

[![Captura-de-pantalla-2025-09-17-180723.png](https://i.postimg.cc/MTZxDyHw/Captura-de-pantalla-2025-09-17-180723.png)](https://postimg.cc/5HrZ9Q8K)

---

### 🔹 2. Validar el chart con Helm (local)

Antes de que ArgoCD lo despliegue, prueba el render del chart:

```bash
helm template myapp ./charts/myapp
```

Esto mostrará los manifests Kubernetes que se generarían. Verifica que:
- La imagen (`image.repository` y `image.tag`) coincida con lo que subió el pipeline.
- El **Deployment** y el **Service** tengan los nombres correctos.

[![Captura-de-pantalla-2025-09-17-180800.png](https://i.postimg.cc/cJB0wDsT/Captura-de-pantalla-2025-09-17-180800.png)](https://postimg.cc/5HyhMSQF)
---


### 🔹 3. Validar que ArgoCD detecta la app

Aplica tu manifest de aplicación:

```bash
kubectl apply -f argocd/application.yaml -n argocd
```

Entra a la UI de ArgoCD:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
# abre en el navegador: https://localhost:8080
```

Credenciales iniciales:
```bash
Usuario: admin
Password: 
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

En la UI deberías ver la app **myapp** con estado **Synced** y **Healthy** ✅.


[![Captura-de-pantalla-2025-09-17-180423.png](https://i.postimg.cc/gjQWmQDc/Captura-de-pantalla-2025-09-17-180423.png)](https://postimg.cc/tn3fzrw8)


---

### 🔹 4. Validar en Kubernetes que la app corre

Revisa los pods:

```bash
kubectl get pods -n myapp
```

Prueba conectarte al servicio (port-forward):

```bash
kubectl port-forward svc/myapp-myapp -n myapp 3000:3000
curl http://localhost:3000
# → Hello from myapp! version=<commit-sha>
```

[![Captura-de-pantalla-2025-09-17-181653.png](https://i.postimg.cc/NMNtP52H/Captura-de-pantalla-2025-09-17-181653.png)](https://postimg.cc/34DzkrB8)
---

## 📌 Resumen

- **Dockerfile + Node app** → imagen construida y push a DockerHub (tag = commit SHA).  
- **charts/myapp/values.yaml** → contiene `image.repository` y `image.tag`.  
- **GitHub Actions** → actualiza automáticamente `values.yaml` tras el build.  
- **ArgoCD** → detecta el cambio en Git y sincroniza el despliegue en Kubernetes.  

Con este flujo, cada commit en `main` termina en un despliegue actualizado en tu cluster Kubernetes 🚀.

