import grequests

reqs = (
    grequests.post("http://localhost:5000/tasks/imagine", 
    json={"prompt": f"Test prompt {i}"}, 
    headers={"Content-Type": "application/json"},
    cookies={'token': '43f65f9a8560-4647-8349-b73386718a73'}
    )
  for i in range(15))

for resp in grequests.imap(requests=reqs, size=15):
  print("here")
  print(resp)