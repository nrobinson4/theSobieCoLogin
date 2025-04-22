
   $(document).ready(() => {

     $('.sobieFirst').change((e) => {
     
        e.preventDefault(); 
        $yesNo = $('#' + e.target.getAttribute("id")); 
        
               alert(e);
               
        if ($yesNo.val()==='yes') {
          alert('yes first')
        }
        else if($yesNo.val()==='no')
        {
          alert('no first'); 
        }
    }); 

    $('.sobieStudent').change((e) => {

          e.preventDefault(); 
       $yesNoStudent = $('#' + e.target.getAttribute("id")); 
      
       alert(e);
      if ($yesNoStudent.val() === 'yes') {
        alert('yes student')
      }
      else if ($yesNoStudent.val() === 'no') {
        alert('no student'); 
      }
    });

  });


   -     <li><strong>Reservations:</strong> https://www.sandestin.com, use SOBIE conference code: 24Q5QK</li>
                    
                      - Location: 9300 Emerald Coast Pkwy, Miramar Beach, FL 32550 (On Google Maps)
                      - Additional information:
                      Rooms start at around $160 per night
                      Sandestin has a variety of room types available at the popular Bayside, Luau, and Beachside locations
                      Extend your stay to include the weekend prior at the same great SOBIE Conference Rate
                      We encourage you to bring your family to enjoy the beach, as well as all the resort offers you to experience in
                      recreation, dining, shopping, and entertainment!