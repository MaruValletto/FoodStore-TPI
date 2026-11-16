import os, sys, tempfile
from pathlib import Path
from fastapi.testclient import TestClient
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from app.main import create_app
from app.db.seed import seed

checks=0
def expect(response,status):
    global checks
    assert response.status_code==status,(response.request.method,str(response.request.url),response.status_code,response.text)
    checks+=1
    return response.json() if response.content else None

def test_acceptance():
    with tempfile.TemporaryDirectory(prefix='foodstore-tpi-') as tmp:
        url=os.environ.get('TEST_DATABASE_URL')
        if url: assert 'test_tpi_' in url, 'Solo se admiten esquemas temporales test_tpi_'
        app=create_app(url or 'sqlite:///'+str(Path(tmp)/'test.db').replace('\\','/'))
        with TestClient(app) as admin, TestClient(app) as customer, TestClient(app) as other:
            seed(app.state.engine);seed(app.state.engine)
            A='/api/v1'
            cats=expect(admin.get(A+'/categorias'),200);assert len(cats)==6
            products=expect(admin.get(A+'/productos',params={'limit':100}),200);assert products['total']==20
            expect(customer.post(A+'/categorias',json={'nombre':'Nueva'}),401)
            expect(admin.post(A+'/auth/token',data={'username':'admin','password':'incorrecta'}),401)
            login=admin.post(A+'/auth/token',data={'username':'admin','password':'Admin1234!'})
            expect(login,200);assert 'httponly' in login.headers['set-cookie'].lower();assert 'access_token' not in login.json()
            for client,name in [(customer,'cliente'),(other,'otrocliente')]:
                registration={'username':name,'full_name':'Cliente de prueba','email':name+'@example.com','password':'Clave1234!'}
                user=expect(client.post(A+'/auth/register',json=registration),201)
                assert user['role']=='user' and 'hashed_password' not in user and 'password' not in user
                expect(client.post(A+'/auth/register',json=registration),409)
                expect(client.post(A+'/auth/token',data={'username':name,'password':'Clave1234!'}),200)
            expect(customer.post(A+'/categorias',json={'nombre':'Prohibida'}),403)
            expect(customer.post(A+'/auth/register',json={'username':'injection','full_name':'Prueba','email':'inj@example.com','password':'Clave1234!','role':'admin'}),422)
            cat=expect(admin.post(A+'/categorias',json={'nombre':'Prueba transaccional','descripcion':'Conservar'}),201)
            updated=expect(admin.put(A+f'/categorias/{cat["id"]}',json={'nombre':'Prueba editada'}),200)
            assert updated['descripcion']=='Conservar'
            product=expect(admin.post(A+'/productos',json={'nombre':'Producto transaccional','categoria_id':cat['id'],'precio_base':123.45,'stock':5,'imagen_url':'/media/pizza.png'}),201)
            pid=product['id']
            order={'items':[{'producto_id':pid,'cantidad':2}],'forma_pago':'EFECTIVO','direccion_entrega':'San Martín 123'}
            def stock(): return expect(admin.get(A+f'/productos/{pid}'),200)['stock']
            bad={**order,'items':[{'producto_id':pid,'cantidad':1},{'producto_id':999999,'cantidad':1}]}
            expect(customer.post(A+'/pedidos',json=bad),404);assert stock()==5
            expect(customer.post(A+'/pedidos',json={**order,'items':[]}),422)
            expect(customer.post(A+'/pedidos',json={**order,'items':order['items']*2}),400)
            expect(customer.post(A+'/pedidos',json={**order,'items':[{'producto_id':pid,'cantidad':6}]}),400)
            created=expect(customer.post(A+'/pedidos',json=order),201);oid=created['id']
            assert created['total']==246.9 and stock()==3
            expect(other.get(A+f'/pedidos/{oid}'),403)
            assert expect(other.get(A+'/pedidos'),200)['total']==0
            expect(admin.put(A+f'/productos/{pid}',json={'nombre':'Nombre nuevo','precio_base':999}),200)
            old=expect(customer.get(A+f'/pedidos/{oid}'),200)
            assert old['total']==246.9 and old['items'][0]['nombre_producto']=='Producto transaccional'
            expect(customer.patch(A+f'/pedidos/{oid}/cancelar'),200);assert stock()==5
            expect(customer.patch(A+f'/pedidos/{oid}/cancelar'),400);assert stock()==5
            created=expect(customer.post(A+'/pedidos',json=order),201);oid=created['id']
            expect(admin.patch(A+f'/pedidos/{oid}/estado',json={'estado':'ENTREGADO'}),400)
            expect(admin.patch(A+f'/pedidos/{oid}/estado',json={'estado':'EN_PREPARACION'}),200)
            expect(customer.patch(A+f'/pedidos/{oid}/cancelar'),400)
            expect(admin.patch(A+f'/pedidos/{oid}/estado',json={'estado':'ENTREGADO'}),200)
            expect(admin.patch(A+f'/pedidos/{oid}/estado',json={'estado':'CANCELADO'}),400)
            summary=expect(admin.get(A+'/pedidos/resumen'),200)
            assert summary['ingresos_entregados']==1998 and summary['entregados']==1
            expect(customer.get(A+'/pedidos/resumen'),403)
            if url and url.startswith('postgresql'):
                from concurrent.futures import ThreadPoolExecutor
                from threading import Barrier
                expect(admin.patch(A+f'/productos/{pid}/stock',json={'stock':1,'disponible':True}),200)
                barrier=Barrier(2)
                def buy_last_unit(_):
                    client=TestClient(app,cookies=customer.cookies)
                    try:
                        barrier.wait(timeout=10)
                        return client.post(A+'/pedidos',json={**order,'items':[{'producto_id':pid,'cantidad':1}]})
                    finally: client.close()
                with ThreadPoolExecutor(max_workers=2) as pool:
                    responses=list(pool.map(buy_last_unit,range(2)))
                assert sorted(r.status_code for r in responses)==[201,400]
                assert stock()==0
                winner=next(r.json() for r in responses if r.status_code==201)
                expect(customer.patch(A+f'/pedidos/{winner["id"]}/cancelar'),200)
                assert stock()==1
            uid=expect(customer.get(A+'/auth/me'),200)['id']
            expect(admin.post(A+f'/admin/usuarios/{uid}/desactivar'),200)
            disabled=customer.get(A+'/auth/me');expect(disabled,400)
            assert disabled.json()['detail']=='Cuenta de usuario desactivada'
            expect(admin.post(A+f'/admin/usuarios/{uid}/desactivar'),200)
            expect(admin.post(A+f'/admin/usuarios/{uid}/activar'),200)
            aid=expect(admin.get(A+'/auth/me'),200)['id']
            expect(admin.post(A+f'/admin/usuarios/{aid}/desactivar'),400)
            expect(admin.delete(A+f'/categorias/{cat["id"]}'),204)
            expect(admin.get(A+f'/categorias/{cat["id"]}'),404)
            expect(admin.get(A+f'/productos/{pid}'),200)
            expect(admin.post(A+'/categorias',json={'nombre':'Prueba editada'}),409)
            expect(admin.delete(A+f'/productos/{pid}'),204)
            expect(admin.get(A+f'/productos/{pid}'),404)
            expect(admin.patch(A+f'/productos/{pid}/stock',json={'stock':4,'disponible':True}),404)
            image=admin.get('/media/pizza.png');assert image.status_code==200 and image.headers['content-type'].startswith('image/')
            expect(customer.post(A+'/auth/logout'),200)
            expect(customer.get(A+'/auth/me'),401)
    print(f'OK: {checks} comprobaciones HTTP; seed, roles, cookies, CRUD, snapshots y stock transaccional.')

if __name__=='__main__': test_acceptance()
