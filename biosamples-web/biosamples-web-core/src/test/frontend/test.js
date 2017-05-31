const assert = require('assert');
const utilities = require('../../../src/main/frontend/js/utilities/utilities');
describe("String Utilities", function() {
    describe("deserialize filter", function() {
        it("should deserialize encoded filter", function() {
            let filterQuery = "external_references_nameFilter%7CArrayExpress";
            let filterObj = utilities.deserializeFilterQuery(filterQuery);
            let expectedObject = {
                "external_references_name": "ArrayExpress"
            };
            assert.deepEqual(expectedObject, filterObj);
        });
        it("should deserialize not encoded filter", function() {
            let filterQuery = "external_references_nameFilter|ArrayExpress";
            let filterObj = utilities.deserializeFilterQuery(filterQuery);
            let expectedObject = {
                "external_references_name": "ArrayExpress"
            };
            assert.deepEqual(expectedObject, filterObj);
        });
        it("should deserialize multiple filters", function() {
            let filterQuery = "content_typeFilter|samples,external_references_nameFilter|ENA,sample_countFilter|20";
            let filterObj = utilities.deserializeFilterQuery(filterQuery);
            let expectedObject = {
                "external_references_name": "ENA",
                "content_type": "samples",
                "sample_count": 20
            };
            assert.deepEqual(filterObj, expectedObject);
        });
        it("should coerce numeric string to number", function() {
            let filterQuery = "sample_countFilter|20";
            let filterObj = utilities.deserializeFilterQuery(filterQuery);
            let expectedObj = {"sample_count": 20};
            assert.deepEqual(filterObj, expectedObj);
        });
    });
    describe("serialize filter", function() {
        it("should serialize filter object", function() {
            let filterObj = {content_type: "samples"};
            let serializedFilter = utilities.serializeFilterQuery(filterObj);
            let expectedSerialization = encodeURI("content_typeFilter|samples");
            assert.equal(serializedFilter, expectedSerialization);
        });
        it("should serialize filter object with multiple keys", function() {
            let filterObj = {
                content_type: "groups",
                external_references_name: "ArrayExpress",
                sample_count: 20
            };
            let serializedFilter = utilities.serializeFilterQuery(filterObj);
            let expectedSerialization = encodeURI(
                "content_typeFilter|groups," +
                "external_references_nameFilter|ArrayExpress," +
                "sample_countFilter|20"
            );
            assert.equal(serializedFilter, expectedSerialization);
        });
    })

});