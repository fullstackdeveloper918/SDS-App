import { Form, json, useLoaderData } from "@remix-run/react";
import { Button } from "@shopify/polaris";
import {authenticate} from '../shopify.server'
import axios from "axios";

export async function loader({ request }) {
  // Parse URL parameters
  const url = new URL(request.url);
  const search_string = url.searchParams.get("name");
  const product_code = url.searchParams.get("product_code");
  const language_code = url.searchParams.get("language");
  const region = url.searchParams.get("region");

  console.log(search_string, language_code, "search strig and language code");

  // Construct API URL
  const apiUrl = `https://discovery.sdsmanager.com/webshop/sds_search?search_string=${search_string}&language_code=${language_code}&page_size=10&page_index=0`;

  // Access token to be added to headers
  const accessToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJsdWFuYmU2OCtuZXRwb3dlcl90ZXN0QGdtYWlsLmNvbSIsImV4cCI6MTc0MjU1NDQwMH0.wma47s2LnqskpSFVDkN1vroKyWEMM64L-0FZwnCCYs8";

  try {
    const res = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    console.log(data, 'hastoken')

    return json({
      data: data?.results,
      status: 200,
    });
  } catch (error) {
    console.log("Error:", error);
    return json({ error: error.message }, { status: 500 });
  }
};


export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const product_id = url.searchParams.get("product_id");
  console.log(product_id, 'id m getting')
  const { shop } = session;
  console.log("shop123",shop)
  const formData = await request.formData();
  const customer_id = formData.get("customer_id");
  const sdspdf_id = formData.get("sdspdf_id");


  const accessToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJsdWFuYmU2OCtuZXRwb3dlcl90ZXN0QGdtYWlsLmNvbSIsImV4cCI6MTc0MjU1NDQwMH0.wma47s2LnqskpSFVDkN1vroKyWEMM64L-0FZwnCCYs8";

  if (request.method === "POST") {
    const apiUrl = `https://discovery.sdsmanager.com/webshop/get_permanent_link?customer_id=${customer_id}&sdspdf_id=${sdspdf_id}&product_id=${product_id}`;
    
    try {

      console.log('first api')
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();     
      const description = data?.link; 


      try{
        if(description) {
          let productData = JSON.stringify({
            product: {
              id: product_id,
              body_html: description, 
            },
          });
  
          let config = {
            method: "put",
            maxBodyLength: Infinity,
            url: `https://${shop}/admin/api/2025-01/products/${product_id}.json`,
            headers: {
              "X-Shopify-Access-Token": session?.accessToken,
              "Content-Type": "application/json",
            },
            data: productData,
          };
  
          let productResponse = await axios.request(config);
          console.log(productResponse, 'check productResponse')
          return json({
            message: "Shopify product updated successfully",
            status: 200,
            data: productResponse,
          });
        }
      }catch(err) {
       console.log(err, 'shopify error');
       return json({
        message: 'Something went wrong',
        status: 500
       })
      }

     

   
    } catch (err) {
      console.log(err, "checkerr");
      return json({
        message: "Something Went Wrong",
        status: 500,
        error: err.message,
      });
    }
  } else {
    return null;
  }
}





export default function StoreData() {
  const { data } = useLoaderData();

  


  return (
    <Form method="POST">

   
    <div>
      {data && data.length > 0 ? (
        <table>
          <tr>
            <th>Date</th>
            <th>Product Name</th>
            <th>Language</th>
            <th>Action</th>
          </tr>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item?.sds_pdf_revision_date}</td>
                <td>{item?.sds_pdf_product_name}</td>
                <td>{item?.language_name}</td>
                <input type="hidden" name="customer_id" value={1865} />
                <input type="hidden" name="sdspdf_id" value={6708036} />
                <input type="hidden" name="product_id" value={35945} />
                <td>
                  <button type="submit">Add</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available</p>
      )}
    </div>
    </Form>
  );
}
