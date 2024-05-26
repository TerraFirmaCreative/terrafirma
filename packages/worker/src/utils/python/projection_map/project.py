import cv2
import numpy as np
import pandas as pd
import urllib.request
import argparse
from gql import gql, Client
from gql.transport.aiohttp import AIOHTTPTransport
import base64
import json
import dotenv
import os

dotenv.load_dotenv()

parser = argparse.ArgumentParser()
parser.add_argument('id', action='store')
parser.add_argument('url', action='store')

transport = AIOHTTPTransport(
  url=f'https://{os.environ["SHOPIFY_STORE_DOMAIN"]}/admin/api/2024-04/graphql.json',
  headers={'X-Shopify-Access-Token': os.environ['SHOPIFY_ADMIN_ACCESS_TOKEN']}
)

gql_client = Client(transport=transport, fetch_schema_from_transport=True)


def extend_canvas(src, h, w):
  dest = np.append(src, np.zeros((h - src.shape[0], src.shape[1], 3)), 0)
  dest = np.append(dest, np.zeros((dest.shape[0], (w - dest.shape[1]), 3)), 1)
  return dest

def resize_stretch(src, dest):
  resized = cv2.resize(src, dest.shape[:2])
  return resized

def imread_url(url):
  req = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.47 Safari/537.36'}))
  return cv2.imdecode(np.asarray(bytearray(req.read()), dtype=np.uint8), -1)

def get_product(shopify_gid):
  res = gql_client.execute(gql(
    """
      query getProduct($id: ID!) {
        product(id: $id) {
          featuredImage {
            url
          }
        }
      }
    """
  ), {
    'id': shopify_gid
  })

  return res.product

def upload_image(shopify_gid, buffer):
  None
  
def process_image(img, url):
  design = imread_url(url)
  bg = cv2.imread(f'./images/{img}/original.png').astype(np.float32)
  bg_mask = cv2.imread(f'./images/{img}/mask.png').astype(np.float32)[:,:,:3] / 255

  origin_grid = pd.read_csv('./transforms/original.csv', names=['xs', 'ys']).to_numpy().astype(np.float32) * bg.shape[0]
  persp_grid = pd.read_csv(f'./transforms/{img}/transform.csv', names=['xs', 'ys']).to_numpy().astype(np.float32)  * bg.shape[0]

  transform = cv2.getPerspectiveTransform(origin_grid, persp_grid)

  # I dont think we should have to stretch this
  design = resize_stretch(design, bg)
  warped = cv2.warpPerspective(design, transform, bg.shape[:2])

  #                      |Shadows    |Sheen        |masking   |alpha over
  composite = ((warped * (bg / 255) + bg * 0.15) * bg_mask) + bg * (1 - bg_mask)

  cv2.imwrite('./out/out.png', composite)

  return base64.b64encode(cv2.imencode('.png', composite)[1])

def main(args):
  a_base64 = process_image('a', args.url)

  print(json.dumps([a_base64.decode()]))

if __name__ == "__main__":
  main(parser.parse_args())